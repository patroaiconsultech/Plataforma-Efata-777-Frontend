import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminOverview, getAdminOverview, getMe, HyperCocreatorMe } from "../api";
import "../admin.css";

export default function AdminPanel() {
  const [me, setMe] = useState<HyperCocreatorMe | null>(null);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMe().then((profile) => {
      if (!active) return;
      setMe(profile);
      if (!profile.admin_access) {
        setError("Acesso administrativo não autorizado.");
        return;
      }
      return getAdminOverview().then((overview) => active && setData(overview));
    }).catch(() => active && setError("Não foi possível validar a autorização administrativa."));
    return () => { active = false; };
  }, []);

  if (error) return <main className="admin-shell"><h1>403</h1><p>{error}</p><Link to="/app">Voltar à Plataforma</Link></main>;
  return <main className="admin-shell" id="main-content">
    <header><div><span>PLATAFORMA · GOVERNANÇA</span><h1>Painel Admin</h1><p>{me?.email}</p></div><Link to="/app">Voltar à Plataforma</Link></header>
    {!data ? <p>Carregando visão administrativa…</p> :
    <section className="admin-grid">
      <article><span>Usuários ativos</span><strong>{data.users}</strong></article>
      <article><span>Co-Criadores</span><strong>{data.co_creator_profiles}</strong></article>
      <article><span>Conversas</span><strong>{data.threads}</strong></article>
      <article><span>Mensagens</span><strong>{data.messages}</strong></article>
      <article className="wide"><span>Governança</span><h2>Evolução da Plataforma permanece separada do Hyper Co-Criador.</h2><p>O Co-Criador do usuário não recebe capacidades de GitHub, merge, deploy, migration ou autoevolução.</p></article>
    </section>}
  </main>;
}
