"""Keep a copy-import deployment offline until its validated import is complete."""
import os
import time
import psycopg2


def wait_for_import():
    import_id = os.environ.get("ATI_IMPORT_ID", "")
    if not import_id:
        raise RuntimeError("ATI_IMPORT_ID is required while ATI_WAIT_FOR_IMPORT is enabled")
    deadline = time.monotonic() + 600
    while time.monotonic() < deadline:
        with psycopg2.connect(os.environ["DATABASE_URL"], connect_timeout=15) as connection:
            connection.set_session(readonly=True, autocommit=True)
            with connection.cursor() as cursor:
                cursor.execute("SELECT to_regclass('public.ati_import_runs')")
                if cursor.fetchone()[0]:
                    cursor.execute(
                        "SELECT status FROM public.ati_import_runs WHERE import_id = %s",
                        (import_id,),
                    )
                    row = cursor.fetchone()
                    if row and row[0] == "COMPLETED":
                        cursor.execute("SELECT count(*) FROM users WHERE role_id = 1")
                        if cursor.fetchone()[0] > 0:
                            print("Validated import is complete; starting ATI.")
                            return
        print("Waiting for the validated DSR copy import...", flush=True)
        time.sleep(5)
    raise RuntimeError("DSR copy import did not complete within the startup window")


if __name__ == "__main__":
    wait_for_import()
