import React, { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";

export default function App() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfLabel, setPdfLabel] = useState("Baixar PDF");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactBusy, setContactBusy] = useState(false);
  const [contactStatus, setContactStatus] = useState(null); // "ok" | "err" | null
  const mainRef = useRef(null);

  const pdfFilename = useMemo(() => "Guilherme-Barroso.pdf", []);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  function getBaseResume() {
    // Base (NÃO é mutado). A versão adaptada sempre é uma cópia.
    return {
      name: "JOSÉ GUILHERME DA SILVEIRA BARROSO",
      role: "Desenvolvedor | Técnico em Informática",
      contact: [
        "E-mail: jdasilveirabarroso@gmail.com",
        "Telefone: (85) 9 9616-0469",
        "LinkedIn: linkedin.com/in/guilherme-barroso-119481219",
        "GitHub: github.com/JGuilhermeB",
      ],
      experience: [
        {
          title: "Chefe de Cozinha",
          orgLine: "Exército Brasileiro – Fortaleza, CE • 2022 – Atual",
          bullets: [
            "Liderança de equipe com 12+ militares, definição de metas e redução de atrasos em 20% e retrabalho em 15%.",
            "Melhorias operacionais: +40% na qualidade das refeições e -20% no desperdício.",
            "Desenvolvimento de um sistema de controle inteligente de materiais, unindo TI e Administração.",
          ],
        },
        {
          title: "Estagiário de Suporte e Desenvolvimento Full stack",
          orgLine: "HomeFly – Remoto • 2025 – 2026",
          bullets: [
            "Desenvolvimento de interfaces modernas com React e Next.js.",
            "Implementação de funcionalidades a partir de requisitos abertos e integração com APIs REST.",
            "Resolução de problemas técnicos de forma independente, apoiado por documentação e comunidades.",
          ],
        },
        {
          title: "Estagiário de Suporte e Desenvolvimento de Sistemas",
          orgLine: "Donkey Head Cervejaria – Fortaleza, CE • 2021 – 2022",
          bullets: [
            "Administração de banco de dados de estoque com rotinas de atualização e backup: +35% precisão, menos inconsistências.",
            "Suporte técnico a sistemas internos, reduzindo o tempo de inatividade em 40%.",
            "Atualização da página web da empresa e criação de conteúdo para redes sociais (+30% engajamento em 3 meses)",
          ],
        },
      ],
      education: [
        "Tecnólogo em Cibersegurança - Faculdade Uniasselvi • 2023 – 2026",
        "Técnico em Administração - Instituto Federal do Ceará (IFCE) • 2023 – 2025",
        "Técnico em Informática - EEEP Onélio Porto • 2019 – 2021",
      ],
      courses: [
        "Formação Dev Full Stack - Digital Collegue / IEL • 2025 • 192h",
        "ISO-27001 - SkillFront",
      ],
      projects: [
        "BGN (IFCE): Projeto para aprendizado de redes e preparação para certificação HCIA (Huawei), do básico ao avançado, com práticas em laboratório no IFCE.",
        "V2MR: Atuação como suporte N1/N2 na migração e configuração de servidores Huawei e resolução de problemas de instalação. Duração: 4 meses (out/2025 – jan/2026).",
      ],
    };
  }

  async function generatePdf({ filename = pdfFilename, silent = true, resumeOverride } = {}) {
    if (pdfBusy) return null;
    setPdfBusy(true);
    setPdfLabel("Gerando…");

    try {
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      // PDF ATS-friendly: texto selecionável (não imagem).
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const marginX = 48;
      const marginY = 54;
      const contentW = pageW - marginX * 2;
      const lineH = 14;
      const sectionGap = 10;
      const blockGap = 8;

      const ensureSpace = (y, needed) => {
        if (y + needed <= pageH - marginY) return y;
        pdf.addPage();
        return marginY;
      };

      const addWrapped = (text, x, y, opts = {}) => {
        const { fontSize = 11, font = "helvetica", style = "normal" } = opts;
        pdf.setFont(font, style);
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, contentW);
        for (const ln of lines) {
          y = ensureSpace(y, lineH);
          pdf.text(String(ln), x, y);
          y += lineH;
        }
        return y;
      };

      const addTitle = (text, y) => {
        y = ensureSpace(y, 18);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.text(text, marginX, y);
        return y + 18;
      };

      const addRole = (text, y) => {
        y = ensureSpace(y, 16);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.text(text, marginX, y);
        return y + 16;
      };

      const addSectionHeader = (text, y) => {
        y = ensureSpace(y, 18);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text(text.toUpperCase(), marginX, y);
        return y + 14;
      };

      const addJobHeader = (title, orgLine, y) => {
        y = ensureSpace(y, 16);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(title, marginX, y);
        y += 14;

        y = ensureSpace(y, 14);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10.5);
        pdf.text(orgLine, marginX, y);
        return y + 14;
      };

      const addBullets = (items, y) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10.5);
        for (const item of items) {
          const bullet = `- ${item}`;
          const lines = pdf.splitTextToSize(bullet, contentW);
          for (const ln of lines) {
            y = ensureSpace(y, lineH);
            pdf.text(String(ln), marginX, y);
            y += lineH;
          }
        }
        return y;
      };

      const resume = resumeOverride ?? getBaseResume();

      let y = marginY;
      y = addTitle(resume.name, y);
      y = addRole(resume.role, y);

      y += 2;
      for (const c of resume.contact) {
        y = addWrapped(c, marginX, y, { fontSize: 10.5 });
      }

      y += sectionGap;
      y = addSectionHeader("Experiência profissional", y);
      for (const job of resume.experience) {
        y = addJobHeader(job.title, job.orgLine, y);
        y = addBullets(job.bullets, y);
        y += blockGap;
      }

      y += sectionGap;
      y = addSectionHeader("Educação", y);
      for (const ed of resume.education) {
        y = addWrapped(`- ${ed}`, marginX, y, { fontSize: 10.5 });
      }

      y += sectionGap;
      y = addSectionHeader("Cursos e certificações", y);
      for (const cr of resume.courses) {
        y = addWrapped(`- ${cr}`, marginX, y, { fontSize: 10.5 });
      }

      y += sectionGap;
      y = addSectionHeader("Projetos", y);
      for (const pr of resume.projects) {
        y = addWrapped(pr, marginX, y, { fontSize: 10.5 });
        y += 2;
      }

      if (!silent) pdf.save(filename);
      return pdf;
    } catch (err) {
      // Loga o erro real para depuração no navegador.
      // (Antes isso era engolido e parecia "misterioso".)
      console.error("Falha ao gerar PDF:", err);
      setPdfLabel("Falhou — veja o console");
      window.setTimeout(() => setPdfLabel("Baixar PDF"), 2200);
      return null;
    } finally {
      setPdfBusy(false);
      window.setTimeout(() => {
        setPdfLabel((cur) => (cur === "Gerando…" ? "Baixar PDF" : cur));
      }, 0);
    }
  }

  useEffect(() => {
    window.generateLandingPdf = generatePdf;

    const onKeyDown = (e) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      if (!cmdOrCtrl || !e.shiftKey) return;
      if ((e.key || "").toLowerCase() !== "p") return;
      e.preventDefault();
      void generatePdf({ silent: false });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pdfFilename]); // eslint-disable-line react-hooks/exhaustive-deps

  async function sendContactEmail() {
    if (contactBusy) return;
    setContactBusy(true);
    setContactStatus(null);
    try {
      const payload = {
        name: contactName.trim(),
        email: contactEmail.trim(),
        subject: contactSubject.trim(),
        message: contactMessage.trim(),
      };

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      setContactStatus("ok");
      setContactMessage("");
    } catch (err) {
      console.error("Falha ao enviar e-mail:", err);
      setContactStatus("err");
    } finally {
      setContactBusy(false);
      window.setTimeout(() => setContactStatus(null), 2500);
    }
  }

  return (
    <>
      <a className="skip" href="#conteudo">
        Pular para o conteúdo
      </a>

      <header className="top">
        <div className="wrap top__inner">
          <div className="brand" aria-label="Marca">
            <div className="brand__mark" aria-hidden="true">
              JG
            </div>
            <div className="brand__text">
              <div className="brand__name">José Guilherme Barroso</div>
              <div className="brand__role">Desenvolvedor • Técnico em Informática</div>
            </div>
          </div>

          <nav className="nav" aria-label="Navegação principal">
            <a href="#experiencia">Experiência</a>
            <a href="#educacao">Educação</a>
            <a href="#projetos">Projetos</a>
            <a href="#contato" className="nav__cta">
              Contato
            </a>
          </nav>
        </div>
      </header>

      <main id="conteudo" ref={mainRef}>
        <section className="hero">
          <div className="wrap hero__grid">
            <div className="hero__copy">
              <p className="kicker">Fortaleza, CE • Remoto</p>
              <h1>Construo interfaces modernas e sistemas práticos, unindo TI e visão operacional.</h1>
              <p className="lede">
                Experiência com <strong>React</strong>, <strong>Next.js</strong> e integração com{" "}
                <strong>APIs REST</strong>. Perfil mão-na-massa, com foco em entregar qualidade, reduzir retrabalho e
                resolver problemas com autonomia.
              </p>

              <div className="hero__actions">
                <a className="btn btn--primary" href="#contato">
                  Falar comigo
                </a>
                <a className="btn btn--ghost" href="#experiencia">
                  Ver experiência
                </a>
                <button
                  className="btn btn--ghost"
                  type="button"
                  id="pdf-btn"
                  aria-label="Baixar currículo em PDF"
                  aria-busy={pdfBusy ? "true" : "false"}
                  disabled={pdfBusy}
                  onClick={() => void generatePdf({ silent: false })}
                >
                  {pdfLabel}
                </button>
              </div>

              <div className="chips" aria-label="Destaques">
                <span className="chip">React</span>
                <span className="chip">Next.js</span>
                <span className="chip">APIs REST</span>
                <span className="chip">Banco de dados</span>
                <span className="chip">Suporte N1/N2</span>
                <span className="chip">Cibersegurança</span>
              </div>
            </div>

            <aside className="card contact" aria-label="Cartão de contato">
              <div className="contact__header">
                <h2>Contato</h2>
                <p>Resposta rápida e objetiva.</p>
              </div>

              <ul className="contact__list">
                <li>
                  <span className="label">E-mail</span>
                  <a href="mailto:jdasilveirabarroso@gmail.com">jdasilveirabarroso@gmail.com</a>
                </li>
                <li>
                  <span className="label">Telefone</span>
                  <a href="tel:+5585996160469">(85) 9 9616-0469</a>
                </li>
                <li>
                  <span className="label">LinkedIn</span>
                  <a
                    href="https://linkedin.com/in/guilherme-barroso-119481219"
                    target="_blank"
                    rel="noreferrer"
                  >
                    /in/guilherme-barroso-119481219
                  </a>
                </li>
                <li>
                  <span className="label">GitHub</span>
                  <a href="https://github.com/JGuilhermeB" target="_blank" rel="noreferrer">
                    @JGuilhermeB
                  </a>
                </li>
              </ul>

              <div className="contact__note">
                <p className="muted">Você também pode baixar um PDF desta página.</p>
              </div>
            </aside>
          </div>

          <div className="wrap stats" aria-label="Indicadores">
            <div className="stat">
              <div className="stat__num">12+</div>
              <div className="stat__label">liderados em equipe</div>
            </div>
            <div className="stat">
              <div className="stat__num">40%</div>
              <div className="stat__label">mais qualidade (operações)</div>
            </div>
            <div className="stat">
              <div className="stat__num">35%</div>
              <div className="stat__label">mais precisão (estoque)</div>
            </div>
            <div className="stat">
              <div className="stat__num">2026</div>
              <div className="stat__label">atuação recente em dev</div>
            </div>
          </div>
        </section>

        <section id="experiencia" className="section">
          <div className="wrap">
            <div className="section__head">
              <h2>Experiência profissional</h2>
              <p>Resultados, contexto e responsabilidade.</p>
            </div>

            <div className="timeline" role="list">
              <article className="item" role="listitem">
                <div className="item__top">
                  <h3>Chefe de Cozinha</h3>
                  <div className="meta">Exército Brasileiro • Fortaleza, CE • 2022 – Atual</div>
                </div>
                <ul className="bullets">
                  <li>Liderança de equipe com 12+ militares, definição de metas e redução de atrasos em 20% e retrabalho em 15%.</li>
                  <li>Melhorias operacionais: +40% na qualidade das refeições e -20% no desperdício.</li>
                  <li>Desenvolvimento de um sistema de controle inteligente de materiais, unindo TI e Administração.</li>
                </ul>
              </article>

              <article className="item" role="listitem">
                <div className="item__top">
                  <h3>Estagiário de Suporte e Desenvolvimento Full stack</h3>
                  <div className="meta">HomeFly • Remoto • 2025 – 2026</div>
                </div>
                <ul className="bullets">
                  <li>Desenvolvimento de interfaces modernas com React e Next.js.</li>
                  <li>Implementação de funcionalidades a partir de requisitos abertos e integração com APIs REST.</li>
                  <li>Resolução de problemas técnicos de forma independente, apoiado por documentação e comunidades.</li>
                </ul>
              </article>

              <article className="item" role="listitem">
                <div className="item__top">
                  <h3>Estagiário de Suporte e Desenvolvimento de Sistemas</h3>
                  <div className="meta">Donkey Head Cervejaria • Fortaleza, CE • 2021 – 2022</div>
                </div>
                <ul className="bullets">
                  <li>Administração de banco de dados de estoque com rotinas de atualização e backup: +35% precisão, menos inconsistências.</li>
                  <li>Suporte técnico a sistemas internos, reduzindo o tempo de inatividade em 40%.</li>
                  <li>Atualização da página web da empresa e criação de conteúdo para redes sociais (+30% engajamento em 3 meses).</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="educacao" className="section section--alt">
          <div className="wrap">
            <div className="section__head">
              <h2>Educação</h2>
              <p>Base técnica + especialização em segurança.</p>
            </div>

            <div className="grid3">
              <div className="card">
                <h3>Tecnólogo em Cibersegurança</h3>
                <p className="meta">Faculdade Uniasselvi • 2023 – 2026</p>
              </div>
              <div className="card">
                <h3>Técnico em Administração</h3>
                <p className="meta">Instituto Federal do Ceará (IFCE) • 2023 – 2025</p>
              </div>
              <div className="card">
                <h3>Técnico em Informática</h3>
                <p className="meta">EEEP Onélio Porto • 2019 – 2021</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section__head">
              <h2>Cursos e certificações</h2>
              <p>Formação prática e fundamentos de segurança.</p>
            </div>

            <div className="grid2">
              <div className="card">
                <h3>Formação Dev Full Stack</h3>
                <p className="meta">Digital Collegue / IEL • 2025 • 192h</p>
              </div>
              <div className="card">
                <h3>ISO-27001</h3>
                <p className="meta">SkillFront</p>
              </div>
            </div>
          </div>
        </section>

        <section id="projetos" className="section section--alt">
          <div className="wrap">
            <div className="section__head">
              <h2>Projetos</h2>
              <p>Experiências relevantes e impacto.</p>
            </div>

            <div className="grid2">
              <article className="card">
                <h3>BGN (IFCE)</h3>
                <p>
                  Projeto para aprendizado de redes e preparação para certificação HCIA (Huawei), do básico ao avançado,
                  com práticas em laboratório no IFCE.
                </p>
              </article>
              <article className="card">
                <h3>V2MR</h3>
                <p>
                  Atuação como suporte N1/N2 na migração e configuração de servidores Huawei e resolução de problemas de
                  instalação. Duração: 4 meses (out/2025 – jan/2026).
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="contato" className="section">
          <div className="wrap contact2">
            <div className="contact2__copy">
              <h2>Vamos conversar</h2>
              <p className="lede">
                Se você precisa de alguém para construir UI, integrar APIs, manter sistemas e resolver problemas com
                autonomia, me chame.
              </p>
            </div>

            <div className="contact2__actions">
              <button className="btn btn--primary" type="button" onClick={() => void sendContactEmail()} disabled={contactBusy}>
                {contactBusy ? "Enviando…" : contactStatus === "ok" ? "Enviado" : contactStatus === "err" ? "Falhou" : "Enviar e-mail"}
              </button>
              <a
                className="btn btn--ghost"
                href="https://www.linkedin.com/in/guilherme-barroso-119481219/"
                target="_blank"
                rel="noreferrer"
              >
                Abrir LinkedIn
              </a>
              <a className="btn btn--ghost" href="https://github.com/JGuilhermeB" target="_blank" rel="noreferrer">
                Ver GitHub
              </a>
            </div>
          </div>

          <div className="wrap contactform" aria-label="Formulário de contato">
            <div className="card contactform__card">
              <h3>Mensagem rápida</h3>
              <div className="contactform__grid">
                <input
                  className="contactform__input"
                  type="text"
                  placeholder="Seu nome"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
                <input
                  className="contactform__input"
                  type="email"
                  placeholder="Seu e-mail"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <input
                className="contactform__input"
                type="text"
                placeholder="Assunto"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
              />
              <textarea
                className="contactform__input contactform__textarea"
                rows={5}
                placeholder="Sua mensagem"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
              />
              <div className="contactform__actions">
                <button className="btn btn--primary" type="button" onClick={() => void sendContactEmail()} disabled={contactBusy}>
                  {contactBusy ? "Enviando…" : contactStatus === "ok" ? "Enviado" : contactStatus === "err" ? "Falhou" : "Enviar"}
                </button>
              </div>
              <p className="muted contactform__hint">
                Envio real via servidor. Se falhar, veja o console e confira as variáveis do `.env`.
              </p>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="wrap footer__inner">
            <p className="muted">
              © <span id="year">{year}</span> José Guilherme Barroso
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

