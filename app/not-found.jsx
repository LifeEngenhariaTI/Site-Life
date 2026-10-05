import Link from 'next/link';

export default function NotFound() {
  return <main className="section"><div className="wrap"><span className="eyebrow">404</span><h1>Página não encontrada</h1><p>O endereço informado não existe ou foi movido.</p><Link className="button primary" href="/">Voltar ao início</Link></div></main>;
}
