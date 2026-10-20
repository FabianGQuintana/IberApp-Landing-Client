import { DEMO_ADMIN_CREDENTIALS, DEMO_CREDENTIALS } from "@/lib/rangers/demo";
import type { AuthModule } from "@/services/rangers/auth";

type Credentials = { email: string; password: string };

const ACCOUNTS: { module: AuthModule; title: string; fill: string; elsewhere: string; credentials: Credentials }[] = [
  {
    module: "rangers",
    title: "Guardaparque",
    fill: "Completar como guardaparque",
    elsewhere: "Te lleva a la app de guardaparques.",
    credentials: DEMO_CREDENTIALS,
  },
  {
    module: "admin",
    title: "Administrador",
    fill: "Completar como administrador",
    elsewhere: "Te lleva al panel de administración.",
    credentials: DEMO_ADMIN_CREDENTIALS,
  },
];

type Props = {
  /** Module whose login shows the box: its account goes first */
  module: AuthModule;
  onPick: (credentials: Credentials) => void;
};

/** "Modo demostración" box of the shared login: both test accounts, each with its own fill button. */
export function DemoAccounts({ module, onPick }: Props) {
  const accounts = [...ACCOUNTS].sort((a, b) => Number(b.module === module) - Number(a.module === module));

  return (
    <section aria-labelledby="demo-title" className="flex flex-col gap-3 rounded-[12px] border border-mint/60 bg-mint/10 p-4">
      <h2 id="demo-title" className="eyebrow m-0 text-mint">🧪 Modo demostración</h2>
      <p className="m-0 text-[15px] text-fg">
        Para probar sin servidor, entrá con una de estas cuentas de prueba. Todo queda en este navegador: nada se envía a un servidor real.
      </p>
      {accounts.map((account) => (
        <div key={account.module} className="flex flex-col gap-2 border-t border-mint/30 pt-3">
          <h3 className="m-0 text-[16px] font-semibold text-head">{account.title}</h3>
          {account.module !== module ? <p className="m-0 text-[14px] text-mute">{account.elsewhere}</p> : null}
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[15px]">
            <dt className="text-mute">Email</dt>
            <dd className="m-0 select-all font-semibold">{account.credentials.email}</dd>
            <dt className="text-mute">Contraseña</dt>
            <dd className="m-0 select-all font-semibold">{account.credentials.password}</dd>
          </dl>
          <button
            type="button"
            onClick={() => onPick(account.credentials)}
            className="min-h-12 rounded-[10px] border border-mint bg-transparent px-4 text-[15px] font-semibold text-fg transition-colors hover:bg-mint hover:text-night"
          >
            {account.fill}
          </button>
        </div>
      ))}
    </section>
  );
}
