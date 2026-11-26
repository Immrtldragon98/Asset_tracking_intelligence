"""Import an approved read-only DSR snapshot into an isolated ATI database."""
import json
import os
import sys
import psycopg2
from psycopg2 import sql
from psycopg2.extras import Json

IMPORT_ID = os.environ.get("ATI_IMPORT_ID", "dsr-production-20261126")


def run_import():
    target_url = os.environ["DATABASE_URL"]
    source_url = os.environ.get("ATI_IMPORT_SOURCE_URL", "")
    with psycopg2.connect(target_url, connect_timeout=20) as target:
        with target.cursor() as cursor:
            cursor.execute("SELECT current_database(),to_regclass('public.ati_import_runs')")
            database, marker = cursor.fetchone()
            if database != "asset_tracking_intelligence":
                raise RuntimeError("Refusing import outside the isolated ATI database")
            if marker:
                cursor.execute("SELECT status FROM ati_import_runs WHERE import_id=%s", (IMPORT_ID,))
                row = cursor.fetchone()
                if row and row[0] == "COMPLETED":
                    print("ATI copy import already validated.", flush=True)
                    return
            if not source_url:
                print("No copy source configured; startup guard will wait.", flush=True)
                return
            if source_url == target_url:
                raise RuntimeError("Source and target must be separate databases")
            cursor.execute("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position")
            columns = {}
            for table, column in cursor.fetchall():
                columns.setdefault(table, []).append(column)
            cursor.execute("SELECT c.relname,p.relname FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_class p ON p.oid=k.confrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE k.contype='f' AND n.nspname='public'")
            edges = cursor.fetchall()

        with psycopg2.connect(source_url, connect_timeout=20) as source:
            source.set_session(isolation_level="REPEATABLE READ", readonly=True)
            with source.cursor() as cursor:
                cursor.execute("SELECT current_database()")
                if cursor.fetchone()[0] != "digital_stand_register":
                    raise RuntimeError("Unexpected DSR source database")
                cursor.execute("SELECT table_name,column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position")
                metadata = {}
                for table, column, kind, nullable, default in cursor.fetchall():
                    metadata.setdefault(table, []).append({"column_name": column, "data_type": kind, "is_nullable": nullable, "column_default": default})
                cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name")
                names = [row[0] for row in cursor.fetchall()]
                snapshot = {}
                for name in names:
                    cursor.execute(sql.SQL("SELECT COALESCE(jsonb_agg(to_jsonb(t)),'[]'::jsonb) FROM public.{} t").format(sql.Identifier(name)))
                    snapshot[name] = cursor.fetchone()[0]
                cursor.execute("SELECT version_num FROM alembic_version")
                revision = cursor.fetchone()[0]
        pending = {name: rows for name, rows in snapshot.items() if rows and name in columns and name != "alembic_version"}
        ordered = []
        while pending:
            ready = next((name for name in pending if not any(child == name and parent != name and parent in pending for child, parent in edges)), None)
            if ready is None:
                raise RuntimeError("Copy dependency cycle requires review")
            ordered.append((ready, pending.pop(ready)))
        counts = {}
        with target.cursor() as cursor:
            cursor.execute("CREATE SCHEMA IF NOT EXISTS dsr_import_archive")
            cursor.execute("CREATE TABLE IF NOT EXISTS dsr_import_archive.snapshots (import_id text NOT NULL,table_name text NOT NULL,row_count bigint NOT NULL,records jsonb NOT NULL,source_columns jsonb NOT NULL,PRIMARY KEY(import_id,table_name))")
            cursor.execute("CREATE TABLE IF NOT EXISTS public.ati_import_runs (import_id text PRIMARY KEY,source_project text NOT NULL,source_branch text NOT NULL,source_revision text NOT NULL,status text NOT NULL,completed_at timestamptz,imported_counts jsonb NOT NULL)")
            cursor.execute("INSERT INTO public.ati_import_runs (import_id,source_project,source_branch,source_revision,status,imported_counts) VALUES (%s,'withered-lake-09762482','br-jolly-sound-a1ajo3q4',%s,'IMPORTING','{}'::jsonb) ON CONFLICT(import_id) DO NOTHING", (IMPORT_ID, revision))
            for name, rows in snapshot.items():
                cursor.execute("INSERT INTO dsr_import_archive.snapshots VALUES (%s,%s,%s,%s,%s) ON CONFLICT(import_id,table_name) DO NOTHING", (IMPORT_ID,name,len(rows),Json(rows),Json(metadata.get(name,[]))))
            for name, rows in ordered:
                print("Copying " + name + ": " + str(len(rows)) + " records", flush=True)
                common = [column for column in columns[name] if column in rows[0]]
                ignored = [column for column in columns[name] if column not in common]
                fields = sql.SQL(",").join(map(sql.Identifier, common))
                qualified = sql.Identifier("public", name)
                updates = sql.SQL(",").join(sql.SQL("{}=EXCLUDED.{}").format(sql.Identifier(column),sql.Identifier(column)) for column in common if column != "id")
                cursor.execute(sql.SQL("INSERT INTO {} ({}) SELECT {} FROM jsonb_populate_recordset(NULL::{},%s::jsonb) ON CONFLICT(id) DO UPDATE SET {}").format(qualified,fields,fields,qualified,updates),(Json(rows),))
                cursor.execute(sql.SQL("SELECT count(*) FROM {}").format(qualified))
                if cursor.fetchone()[0] != len(rows):
                    raise RuntimeError("Row count mismatch in " + name)
                cursor.execute(sql.SQL("SELECT count(*) FROM {} a FULL JOIN jsonb_populate_recordset(NULL::{},%s::jsonb) e USING(id) WHERE (to_jsonb(a)-%s::text[]) IS DISTINCT FROM (to_jsonb(e)-%s::text[])").format(qualified,qualified),(Json(rows),ignored,ignored))
                if cursor.fetchone()[0] != 0:
                    raise RuntimeError("Field verification failed in " + name)
                cursor.execute(sql.SQL("SELECT setval(pg_get_serial_sequence(%s,'id'),COALESCE((SELECT max(id) FROM {}),1),EXISTS(SELECT 1 FROM {}))").format(qualified,qualified),("public."+name,))
                counts[name] = len(rows)
            cursor.execute("SELECT count(*) FROM users WHERE role_id=1")
            if cursor.fetchone()[0] == 0:
                raise RuntimeError("No copied administrator exists")
            cursor.execute("SELECT count(*) FROM stand_installations WHERE removed_at IS NULL")
            if cursor.fetchone()[0] != 30:
                raise RuntimeError("Expected 30 installed stand positions")
            cursor.execute("UPDATE ati_import_runs SET status='COMPLETED',completed_at=clock_timestamp(),imported_counts=%s WHERE import_id=%s",(Json(counts),IMPORT_ID))
        print("DSR copy validated: " + json.dumps(counts,sort_keys=True), flush=True)


if __name__ == "__main__":
    try:
        run_import()
    except Exception as error:
        # Never log DSNs, credentials or a failed row's private contents.
        print("Copy import failed: " + type(error).__name__ + " SQLSTATE=" + str(getattr(error,"pgcode",None)),flush=True)
        sys.exit(1)
