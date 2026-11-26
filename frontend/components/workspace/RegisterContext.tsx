import Link from "next/link";
export default function RegisterContext({module,label}:{module:string;label:string}){
  return <nav className="register-context-banner" aria-label="Register context"><span><b>{module}</b> · {label}</span><Link href={"/equipment?register="+module+"&module="+module}>View equipment in plant hierarchy →</Link></nav>;
}
