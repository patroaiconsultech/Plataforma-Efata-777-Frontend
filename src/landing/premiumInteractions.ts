import { initNeuralWebgl } from "./neuralWebgl";

type PremiumLandingOptions = {
  root: HTMLElement;
  onPrivateAccess: () => void | Promise<void>;
  onPwaSlot?: (slot: HTMLElement | null) => void;
};

const translations: Record<string, Record<string, string>> = {
        pt: {
          "nav.ecosystem": "Ecossistema", "nav.governance": "Governança", "nav.method": "Método", "nav.contact": "Contato", "nav.careers": "Carreiras", "nav.cocreator": "Co-Criador", "nav.private": "Acesso privado", "immersive.eyebrow": "PATROAI · EXPERIÊNCIA IMERSIVA", "immersive.title": "Este é um ambiente imersivo.", "immersive.copy": "Escolha como deseja iniciar sua experiência PatroAI.", "immersive.sound.cta": "Entrar com experiência sonora", "immersive.sound.copy": "Iniciar a obra dentro da experiência PatroAI", "immersive.silent": "Explorar sem som", "immersive.direct": "Ir direto para a apresentação", "immersive.headphones": "Recomendamos o uso de fones de ouvido para uma experiência mais imersiva.", "lobby.eyebrow": "PATROAI · NÚCLEO IMERSIVO", "lobby.title": "Escolha por onde deseja entrar.", "lobby.copy": "Navegue pelo ecossistema enquanto a experiência sonora permanece ativa.", "lobby.node.about": "Conheça a PatroAI", "lobby.node.ecosystem": "Ecossistema", "lobby.node.governance": "Governança", "lobby.node.method": "Método", "lobby.node.careers": "Carreiras & Talentos", "lobby.node.contact": "Contato Estratégico", "lobby.node.platform": "Acessar Plataforma", "lobby.hint": "Selecione um núcleo para entrar", "lobby.dragHint": "Toque e conduza o núcleo",
          "hero.eyebrow": "Acesso privado e controlado", "hero.title": "Sistemas governados de <span>IA</span> para fluxos executivos.", "hero.copy": "O Grupo PatroAI une consultoria estratégica, tecnologia aplicada e desenvolvimento de novos negócios para transformar informação complexa em clareza, decisão e execução.", "hero.primary": "Falar com um especialista", "hero.secondary": "Conhecer atuação", "hero.kpi1": "frentes integradas para estratégia, capital relacional e tecnologia.", "hero.kpi2": "por cento orientado a governança, rastreabilidade e decisão.", "hero.kpi3": "ambiente privado para relacionamento qualificado e seguro.",
          "screen.title": "Governança antes da automação.", "screen.copy": "Uma camada executiva para organizar dados, agentes, documentos, risco e decisão com trilhas claras de responsabilidade.", "screen.signal1": "Estratégia aplicada", "screen.signal2": "Teses e parcerias", "screen.signal3": "Sistemas sob medida", "screen.signal4": "Perpetuação responsável", "phone.title": "Sistemas governados de <span class=\"accent\">IA</span>", "phone.copy": "Clareza estratégica, tecnologia e governança para decisão executiva.",
          "ecosystem.eyebrow": "Ecossistema PatroAI", "ecosystem.title": "Três frentes para construir vantagem com critério.", "ecosystem.copy": "A proposta combina visão executiva, estrutura de negócios e engenharia aplicada para projetos que precisam sair do discurso e entrar em operação com controle.",
          "unit.consultech.copy": "Planejamento, valuation, diagnóstico e apoio executivo para decisões de alto impacto.", "unit.consultech.a": "Business plan e estratégia", "unit.consultech.b": "Modelagens dinâmicas de valor", "unit.consultech.c": "Suporte executivo especializado", "unit.holding.copy": "Desenvolvimento de teses, novos negócios e parcerias com potencial de escala e sinergia.", "unit.holding.a": "Projetos por segmento", "unit.holding.b": "Conexão institucional", "unit.holding.c": "Construção de oportunidades", "unit.factory.copy": "Sistemas, automações e ambientes digitais seguros para gestão, decisão e escala operacional.", "unit.factory.a": "IA governada para empresas", "unit.factory.b": "Fluxos executivos inteligentes", "unit.factory.c": "Arquitetura sob medida",
          "governance.eyebrow": "Governança, ESG e perpetuação", "governance.title": "IA que respeita contexto, responsabilidade e continuidade.", "governance.a": "Rastreabilidade desde o desenho da solução.", "governance.b": "Decisões com critério, evidências e limites operacionais.", "governance.c": "Aplicação responsável para empresas, investidores e especialistas.", "governance.d": "Arquitetura preparada para continuidade, escala e controle.", "metric.a": "Diagnóstico estratégico antes de qualquer automação.", "metric.b": "Arquitetura de IA conectada ao negócio e ao risco.", "metric.c": "Rede qualificada para consultores, empresas e investidores.", "metric.d": "Operação privada, controlada e orientada a valor.",
          "method.eyebrow": "Método de implantação", "method.title": "Do briefing ao sistema governado.", "method.copy": "A jornada prioriza aderência, confidencialidade e maturidade operacional. A tecnologia entra quando a decisão, o dado e a responsabilidade já estão claros.", "timeline.a.title": "Triagem estratégica", "timeline.a.copy": "Entendimento do contexto, objetivo de negócio, riscos e prioridade real da organização.", "timeline.b.title": "Arquitetura de valor", "timeline.b.copy": "Modelagem da oportunidade, indicadores, governança e potencial de retorno operacional.", "timeline.c.title": "Protótipo controlado", "timeline.c.copy": "Desenho do fluxo, validação com usuários-chave e limites claros de acesso e execução.", "timeline.d.title": "Escala assistida", "timeline.d.copy": "Evolução incremental com auditoria, melhoria contínua e alinhamento executivo.",
          "legal.eyebrow": "Privacidade e termos", "legal.title": "Uso responsável, dados e governança.", "legal.copy": "Princípios de privacidade, segurança e uso responsável orientam o ambiente PatroAI e a forma como dados, agentes e decisões são tratados.", "legal.privacy.title": "Política de Privacidade", "legal.privacy.copy": "Os dados tratados pela plataforma seguem critérios de segurança, confidencialidade e uso legítimo. Conteúdos enviados podem ser processados para análise, organização, respostas contextuais e funcionamento dos agentes.", "legal.privacy.a": "O usuário deve enviar apenas informações e documentos que tenha direito de compartilhar.", "legal.privacy.b": "Dados sensíveis devem ser tratados com cautela e somente quando necessários ao contexto.", "legal.privacy.c": "Solicitações sobre privacidade, acesso, correção ou exclusão de dados podem ser encaminhadas aos administradores do projeto.", "legal.terms.title": "Termos de Uso", "legal.terms.a": "A plataforma apoia agentes de inteligência artificial, automação assistida, organização de informações e suporte operacional em ambiente controlado.", "legal.terms.b": "Ao utilizar os recursos, o usuário concorda com uso responsável, ético e compatível com segurança, privacidade e governança.", "legal.terms.c": "É vedado uso ilegal, abusivo, fraudulento, discriminatório, invasivo ou que viole direitos de terceiros.", "legal.terms.d": "Respostas de IA podem conter imprecisões e devem ser revisadas antes de decisões operacionais, jurídicas, financeiras, médicas, técnicas ou estratégicas.", "legal.terms.e": "Execuções reais, escrita em repositório, criação de branch, abertura de PR, deploy ou alteração de ambiente dependem de aprovação explícita e fluxo governado.", "legal.terms.f": "Durante testes, podem ocorrer instabilidades, indisponibilidades, ajustes de interface e mudanças de comportamento dos agentes.", "legal.terms.g": "A plataforma é ferramenta de apoio e não substitui análise profissional especializada.", "legal.terms.h": "A continuidade de uso após atualizações poderá representar concordância com a nova versão dos termos.",
          "contact.eyebrow": "Pré-onboarding qualificado", "contact.title": "Solicite uma conversa estratégica.", "contact.copy": "Use este canal para oportunidades estratégicas, acesso privado, implantação, parcerias ou interesse profissional. Conte o contexto em poucas linhas e nossa equipe retornará após uma triagem inicial.", "contact.whatsapp": "WhatsApp estratégico", "form.name": "Nome completo", "form.email": "E-mail", "form.profile": "Perfil", "form.select": "Selecione", "form.profileA": "Empresa / Cliente", "form.profileB": "Investidor", "form.profileC": "Consultor associado", "form.profileD": "Parceiro estratégico", "form.whatsapp": "WhatsApp", "form.challenge": "Oportunidade ou desafio", "form.submit": "Preparar contato", "footer.left": "Grupo PatroAI. Consultech, Holding e AI Factory.", "footer.privacy": "Privacidade e termos", "footer.contact": "Contato", "footer.right": "Acesso privado. Proposta sob análise.", "status": "{name}, seu contato foi preparado para triagem ({profile}).", "meta.title": "Grupo PatroAI | Sistemas governados de IA", "meta.description": "Consultoria estratégica, tecnologia aplicada e sistemas governados de IA para decisões executivas, novos negócios e perpetuação responsável.",
        },
        es: {
          "nav.ecosystem": "Ecosistema", "nav.governance": "Gobernanza", "nav.method": "Método", "nav.contact": "Contacto", "nav.careers": "Carreras", "nav.cocreator": "Co-Creador", "nav.private": "Acceso privado", "immersive.eyebrow": "PATROAI · EXPERIENCIA INMERSIVA", "immersive.title": "Este es un entorno inmersivo.", "immersive.copy": "Elige cómo quieres iniciar tu experiencia PatroAI.", "immersive.sound.cta": "Entrar con experiencia sonora", "immersive.sound.copy": "Iniciar la obra dentro de la experiencia PatroAI", "immersive.silent": "Explorar sin sonido", "immersive.direct": "Ir directamente a la presentación", "immersive.headphones": "Recomendamos usar auriculares para una experiencia más inmersiva.", "lobby.eyebrow": "PATROAI · NÚCLEO INMERSIVO", "lobby.title": "Elige por dónde quieres entrar.", "lobby.copy": "Navega por el ecosistema mientras la experiencia sonora permanece activa.", "lobby.node.about": "Conoce PatroAI", "lobby.node.ecosystem": "Ecosistema", "lobby.node.governance": "Gobernanza", "lobby.node.method": "Método", "lobby.node.careers": "Carreras y Talentos", "lobby.node.contact": "Contacto Estratégico", "lobby.node.platform": "Acceder a la Plataforma", "lobby.hint": "Selecciona un núcleo para entrar", "lobby.dragHint": "Toca y conduce el núcleo",
          "hero.eyebrow": "Acceso privado y controlado", "hero.title": "Sistemas gobernados de <span>IA</span> para flujos ejecutivos.", "hero.copy": "Grupo PatroAI une consultoría estratégica, tecnología aplicada y desarrollo de nuevos negocios para transformar información compleja en claridad, decisión y ejecución.", "hero.primary": "Hablar con un especialista", "hero.secondary": "Conocer el alcance", "hero.kpi1": "frentes integrados para estrategia, capital relacional y tecnología.", "hero.kpi2": "por ciento orientado a gobernanza, trazabilidad y decisión.", "hero.kpi3": "entorno privado para relaciones calificadas y seguras.",
          "screen.title": "Gobernanza antes de la automatización.", "screen.copy": "Una capa ejecutiva para organizar datos, agentes, documentos, riesgos y decisiones con trazabilidad clara de responsabilidad.", "screen.signal1": "Estrategia aplicada", "screen.signal2": "Tesis y alianzas", "screen.signal3": "Sistemas a medida", "screen.signal4": "Continuidad responsable", "phone.title": "Sistemas gobernados de <span class=\"accent\">IA</span>", "phone.copy": "Claridad estratégica, tecnología y gobernanza para la decisión ejecutiva.",
          "ecosystem.eyebrow": "Ecosistema PatroAI", "ecosystem.title": "Tres frentes para construir ventaja con criterio.", "ecosystem.copy": "La propuesta combina visión ejecutiva, estructura de negocios e ingeniería aplicada para proyectos que necesitan pasar del discurso a la operación con control.",
          "unit.consultech.copy": "Planificación, valuation, diagnóstico y apoyo ejecutivo para decisiones de alto impacto.", "unit.consultech.a": "Business plan y estrategia", "unit.consultech.b": "Modelos dinámicos de valor", "unit.consultech.c": "Soporte ejecutivo especializado", "unit.holding.copy": "Desarrollo de tesis, nuevos negocios y alianzas con potencial de escala y sinergia.", "unit.holding.a": "Proyectos por segmento", "unit.holding.b": "Conexión institucional", "unit.holding.c": "Construcción de oportunidades", "unit.factory.copy": "Sistemas, automatizaciones y entornos digitales seguros para gestión, decisión y escala operativa.", "unit.factory.a": "IA gobernada para empresas", "unit.factory.b": "Flujos ejecutivos inteligentes", "unit.factory.c": "Arquitectura a medida",
          "governance.eyebrow": "Gobernanza, ESG y continuidad", "governance.title": "IA que respeta contexto, responsabilidad y continuidad.", "governance.a": "Trazabilidad desde el diseño de la solución.", "governance.b": "Decisiones con criterio, evidencias y límites operativos.", "governance.c": "Aplicación responsable para empresas, inversores y especialistas.", "governance.d": "Arquitectura preparada para continuidad, escala y control.", "metric.a": "Diagnóstico estratégico antes de cualquier automatización.", "metric.b": "Arquitectura de IA conectada al negocio y al riesgo.", "metric.c": "Red calificada para consultores, empresas e inversores.", "metric.d": "Operación privada, controlada y orientada al valor.",
          "method.eyebrow": "Método de implementación", "method.title": "Del briefing al sistema gobernado.", "method.copy": "El recorrido prioriza adherencia, confidencialidad y madurez operativa. La tecnología entra cuando la decisión, el dato y la responsabilidad ya están claros.", "timeline.a.title": "Evaluación estratégica", "timeline.a.copy": "Comprensión del contexto, objetivo de negocio, riesgos y prioridad real de la organización.", "timeline.b.title": "Arquitectura de valor", "timeline.b.copy": "Modelado de la oportunidad, indicadores, gobernanza y potencial de retorno operativo.", "timeline.c.title": "Prototipo controlado", "timeline.c.copy": "Diseño del flujo, validación con usuarios clave y límites claros de acceso y ejecución.", "timeline.d.title": "Escala asistida", "timeline.d.copy": "Evolución incremental con auditoría, mejora continua y alineación ejecutiva.",
          "legal.eyebrow": "Privacidad y términos", "legal.title": "Uso responsable, datos y gobernanza.", "legal.copy": "Los principios de privacidad, seguridad y uso responsable orientan el entorno PatroAI y la forma en que se tratan los datos, agentes y decisiones.", "legal.privacy.title": "Política de Privacidad", "legal.privacy.copy": "Los datos tratados por la plataforma siguen criterios de seguridad, confidencialidad y uso legítimo. Los contenidos enviados pueden procesarse para análisis, organización, respuestas contextuales y funcionamiento de los agentes.", "legal.privacy.a": "El usuario debe enviar únicamente información y documentos que tenga derecho a compartir.", "legal.privacy.b": "Los datos sensibles deben tratarse con cautela y solo cuando sean necesarios para el contexto.", "legal.privacy.c": "Las solicitudes sobre privacidad, acceso, corrección o eliminación de datos pueden enviarse a los administradores del proyecto.", "legal.terms.title": "Términos de Uso", "legal.terms.a": "La plataforma apoya agentes de inteligencia artificial, automatización asistida, organización de información y soporte operativo en un entorno controlado.", "legal.terms.b": "Al utilizar los recursos, el usuario acepta un uso responsable, ético y compatible con seguridad, privacidad y gobernanza.", "legal.terms.c": "Está prohibido el uso ilegal, abusivo, fraudulento, discriminatorio, invasivo o que viole derechos de terceros.", "legal.terms.d": "Las respuestas de IA pueden contener imprecisiones y deben revisarse antes de decisiones operativas, jurídicas, financieras, médicas, técnicas o estratégicas.", "legal.terms.e": "Las ejecuciones reales, escritura en repositorios, creación de ramas, apertura de PR, despliegues o cambios de entorno dependen de aprobación explícita y flujo gobernado.", "legal.terms.f": "Durante las pruebas pueden ocurrir inestabilidades, indisponibilidades, ajustes de interfaz y cambios en el comportamiento de los agentes.", "legal.terms.g": "La plataforma es una herramienta de apoyo y no sustituye el análisis profesional especializado.", "legal.terms.h": "La continuidad de uso después de actualizaciones podrá representar aceptación de la nueva versión de los términos.",
          "contact.eyebrow": "Pre-onboarding calificado", "contact.title": "Solicite una conversación estratégica.", "contact.copy": "Utiliza este canal para oportunidades estratégicas, acceso privado, implantación, alianzas o interés profesional. Cuenta el contexto en pocas líneas y nuestro equipo responderá tras una evaluación inicial.", "contact.whatsapp": "WhatsApp estratégico", "form.name": "Nombre completo", "form.email": "Correo electrónico", "form.profile": "Perfil", "form.select": "Seleccione", "form.profileA": "Empresa / Cliente", "form.profileB": "Inversor", "form.profileC": "Consultor asociado", "form.profileD": "Socio estratégico", "form.whatsapp": "WhatsApp", "form.challenge": "Oportunidad o desafío", "form.submit": "Preparar contacto", "footer.left": "Grupo PatroAI. Consultech, Holding y AI Factory.", "footer.privacy": "Privacidad y términos", "footer.contact": "Contacto", "footer.right": "Acceso privado. Propuesta bajo análisis.", "status": "{name}, su contacto fue preparado para evaluación ({profile}).", "meta.title": "Grupo PatroAI | Sistemas gobernados de IA", "meta.description": "Consultoría estratégica, tecnología aplicada y sistemas gobernados de IA para decisiones ejecutivas, nuevos negocios y continuidad responsable.",
        },
        en: {
          "nav.ecosystem": "Ecosystem", "nav.governance": "Governance", "nav.method": "Method", "nav.contact": "Contact", "nav.careers": "Careers", "nav.cocreator": "Co-Creator", "nav.private": "Private access", "immersive.eyebrow": "PATROAI · IMMERSIVE EXPERIENCE", "immersive.title": "This is an immersive environment.", "immersive.copy": "Choose how you want to start your PatroAI experience.", "immersive.sound.cta": "Enter with sound experience", "immersive.sound.copy": "Start the work inside the PatroAI experience", "immersive.silent": "Explore without sound", "immersive.direct": "Go directly to the presentation", "immersive.headphones": "Headphones are recommended for a more immersive experience.", "lobby.eyebrow": "PATROAI · IMMERSIVE CORE", "lobby.title": "Choose where you want to enter.", "lobby.copy": "Explore the ecosystem while the sound experience remains active.", "lobby.node.about": "Meet PatroAI", "lobby.node.ecosystem": "Ecosystem", "lobby.node.governance": "Governance", "lobby.node.method": "Method", "lobby.node.careers": "Careers & Talent", "lobby.node.contact": "Strategic Contact", "lobby.node.platform": "Access Platform", "lobby.hint": "Select a core to enter", "lobby.dragHint": "Touch and guide the core",
          "hero.eyebrow": "Private and controlled access", "hero.title": "Governed <span>AI</span> systems for executive workflows.", "hero.copy": "Grupo PatroAI combines strategic consulting, applied technology and new-business development to turn complex information into clarity, decisions and execution.", "hero.primary": "Talk to a specialist", "hero.secondary": "Explore our work", "hero.kpi1": "integrated fronts for strategy, relationship capital and technology.", "hero.kpi2": "percent oriented to governance, traceability and decision-making.", "hero.kpi3": "private environment for qualified and secure relationships.",
          "screen.title": "Governance before automation.", "screen.copy": "An executive layer to organize data, agents, documents, risk and decisions with clear accountability trails.", "screen.signal1": "Applied strategy", "screen.signal2": "Theses and partnerships", "screen.signal3": "Tailored systems", "screen.signal4": "Responsible continuity", "phone.title": "Governed <span class=\"accent\">AI</span> systems", "phone.copy": "Strategic clarity, technology and governance for executive decision-making.",
          "ecosystem.eyebrow": "PatroAI Ecosystem", "ecosystem.title": "Three fronts to build advantage with discipline.", "ecosystem.copy": "The proposition combines executive vision, business structure and applied engineering for projects that need to move from discourse into controlled operation.",
          "unit.consultech.copy": "Planning, valuation, diagnosis and executive support for high-impact decisions.", "unit.consultech.a": "Business plan and strategy", "unit.consultech.b": "Dynamic value modeling", "unit.consultech.c": "Specialized executive support", "unit.holding.copy": "Development of theses, new businesses and partnerships with scale and synergy potential.", "unit.holding.a": "Segment-based projects", "unit.holding.b": "Institutional connection", "unit.holding.c": "Opportunity building", "unit.factory.copy": "Systems, automations and secure digital environments for management, decision-making and operational scale.", "unit.factory.a": "Governed AI for companies", "unit.factory.b": "Intelligent executive workflows", "unit.factory.c": "Tailored architecture",
          "governance.eyebrow": "Governance, ESG and continuity", "governance.title": "AI that respects context, responsibility and continuity.", "governance.a": "Traceability from the solution design stage.", "governance.b": "Decisions with discipline, evidence and operational boundaries.", "governance.c": "Responsible application for companies, investors and specialists.", "governance.d": "Architecture prepared for continuity, scale and control.", "metric.a": "Strategic diagnosis before any automation.", "metric.b": "AI architecture connected to business and risk.", "metric.c": "Qualified network for consultants, companies and investors.", "metric.d": "Private, controlled and value-oriented operation.",
          "method.eyebrow": "Implementation method", "method.title": "From briefing to governed system.", "method.copy": "The journey prioritizes fit, confidentiality and operational maturity. Technology enters when the decision, data and accountability are already clear.", "timeline.a.title": "Strategic triage", "timeline.a.copy": "Understanding the context, business objective, risks and the organization's real priority.", "timeline.b.title": "Value architecture", "timeline.b.copy": "Modeling the opportunity, indicators, governance and operational return potential.", "timeline.c.title": "Controlled prototype", "timeline.c.copy": "Workflow design, validation with key users and clear limits for access and execution.", "timeline.d.title": "Assisted scale", "timeline.d.copy": "Incremental evolution with audit, continuous improvement and executive alignment.",
          "legal.eyebrow": "Privacy and terms", "legal.title": "Responsible use, data and governance.", "legal.copy": "Privacy, security and responsible-use principles guide the PatroAI environment and the way data, agents and decisions are handled.", "legal.privacy.title": "Privacy Policy", "legal.privacy.copy": "Data processed by the platform follows security, confidentiality and legitimate-use criteria. Submitted content may be processed for analysis, organization, contextual responses and agent operation.", "legal.privacy.a": "Users should submit only information and documents they are entitled to share.", "legal.privacy.b": "Sensitive data should be handled carefully and only when needed for the context.", "legal.privacy.c": "Privacy, access, correction or deletion requests may be sent to the project administrators.", "legal.terms.title": "Terms of Use", "legal.terms.a": "The platform supports artificial intelligence agents, assisted automation, information organization and operational support in a controlled environment.", "legal.terms.b": "By using the resources, users agree to responsible, ethical use compatible with security, privacy and governance.", "legal.terms.c": "Illegal, abusive, fraudulent, discriminatory, invasive use or use that violates third-party rights is prohibited.", "legal.terms.d": "AI responses may contain inaccuracies and must be reviewed before operational, legal, financial, medical, technical or strategic decisions.", "legal.terms.e": "Real executions, repository writes, branch creation, PR opening, deployment or environment changes require explicit approval and a governed flow.", "legal.terms.f": "During testing, instability, downtime, interface adjustments and changes in agent behavior may occur.", "legal.terms.g": "The platform is a support tool and does not replace specialized professional analysis.", "legal.terms.h": "Continued use after updates may represent acceptance of the new terms version.",
          "contact.eyebrow": "Qualified pre-onboarding", "contact.title": "Request a strategic conversation.", "contact.copy": "Use this channel for strategic opportunities, private access, implementation, partnerships or professional interest. Share the context in a few lines and our team will respond after an initial review.", "contact.whatsapp": "Strategic WhatsApp", "form.name": "Full name", "form.email": "Email", "form.profile": "Profile", "form.select": "Select", "form.profileA": "Company / Client", "form.profileB": "Investor", "form.profileC": "Associated consultant", "form.profileD": "Strategic partner", "form.whatsapp": "WhatsApp", "form.challenge": "Opportunity or challenge", "form.submit": "Prepare contact", "footer.left": "Grupo PatroAI. Consultech, Holding and AI Factory.", "footer.privacy": "Privacy and terms", "footer.contact": "Contact", "footer.right": "Private access. Proposal under review.", "status": "{name}, your contact was prepared for triage ({profile}).", "meta.title": "Grupo PatroAI | Governed AI systems", "meta.description": "Strategic consulting, applied technology and governed AI systems for executive decisions, new ventures and responsible continuity.",
        }
      };

Object.assign(translations.pt, {
  "careers.eyebrow": "Trabalhe conosco",
  "careers.title": "Experiência encontra inteligência.",
  "careers.copy": "Estamos formando uma rede de profissionais capazes de compreender ambientes reais, implantar inteligência artificial com governança e acelerar a evolução de empresas.",
  "careers.consulting.title": "Consultores de implantação de IA",
  "careers.consulting.copy": "Executivos, especialistas de setor e profissionais experientes para diagnóstico, desenho de processos, implantação e adoção de IA.",
  "careers.consulting.cta": "Quero atuar como consultor →",
  "careers.engineering.title": "Engenharia & IA",
  "careers.engineering.copy": "Software, agentes, dados, infraestrutura, segurança e produto para construir a próxima camada do ecossistema PatroAI.",
  "careers.engineering.cta": "Quero construir com a PatroAI →",
  "careers.partnerships.title": "Comercial & Parcerias",
  "careers.partnerships.copy": "Venda consultiva B2B, desenvolvimento de negócios e relacionamento estratégico.",
  "careers.partnerships.cta": "Quero desenvolver negócios →",
  "careers.talent.title": "Banco de talentos",
  "careers.talent.copy": "Perfis multidisciplinares para projetos, programas de formação e futuras oportunidades.",
  "careers.talent.cta": "Entrar no banco de talentos →",
  "careers.note": "As candidaturas passam por triagem qualificada, consentimento e análise de aderência ao ecossistema PatroAI.",
  "cocreator.eyebrow": "Hyper Co-Criador",
  "cocreator.title": "Um parceiro criativo para pensar e construir negócios com você.",
  "cocreator.copy": "Um único Co-Criador combina estratégia, produto, finanças, marketing, vendas, operações, tecnologia e inovação para transformar ideias e desafios em hipóteses, decisões, documentos, análises e próximos passos.",
  "cocreator.kicker": "Um agente · múltiplas capacidades",
  "cocreator.note": "Arquivos, artefatos, voz, realtime e histórico usam as capacidades governadas já disponíveis na Plataforma. A evolução da própria Plataforma permanece restrita ao plano administrativo.",
});

Object.assign(translations.es, {
  "careers.eyebrow": "Trabaja con nosotros",
  "careers.title": "La experiencia encuentra la inteligencia.",
  "careers.copy": "Estamos formando una red de profesionales capaces de comprender entornos reales, implantar inteligencia artificial con gobernanza y acelerar la evolución de empresas.",
  "careers.consulting.title": "Consultores de implantación de IA",
  "careers.consulting.copy": "Ejecutivos, especialistas de sector y profesionales experimentados para diagnóstico, diseño de procesos, implantación y adopción de IA.",
  "careers.consulting.cta": "Quiero trabajar como consultor →",
  "careers.engineering.title": "Ingeniería e IA",
  "careers.engineering.copy": "Software, agentes, datos, infraestructura, seguridad y producto para construir la próxima capa del ecosistema PatroAI.",
  "careers.engineering.cta": "Quiero construir con PatroAI →",
  "careers.partnerships.title": "Comercial y alianzas",
  "careers.partnerships.copy": "Venta consultiva B2B, desarrollo de negocios y relaciones estratégicas.",
  "careers.partnerships.cta": "Quiero desarrollar negocios →",
  "careers.talent.title": "Banco de talentos",
  "careers.talent.copy": "Perfiles multidisciplinarios para proyectos, programas de formación y futuras oportunidades.",
  "careers.talent.cta": "Entrar en el banco de talentos →",
  "careers.note": "Las candidaturas pasan por evaluación calificada, consentimiento y análisis de adecuación al ecosistema PatroAI.",
  "cocreator.eyebrow": "Hyper Co-Creador",
  "cocreator.title": "Un socio creativo para pensar y construir negocios contigo.",
  "cocreator.copy": "Un único Co-Creador combina estrategia, producto, finanzas, marketing, ventas, operaciones, tecnología e innovación para transformar ideas y desafíos en hipótesis, decisiones, documentos, análisis y próximos pasos.",
  "cocreator.kicker": "Un agente · múltiples capacidades",
  "cocreator.note": "Archivos, artefactos, voz, realtime e historial utilizan las capacidades gobernadas ya disponibles en la Plataforma. La evolución de la propia Plataforma permanece restringida al plan administrativo.",
});

Object.assign(translations.en, {
  "careers.eyebrow": "Work with us",
  "careers.title": "Where experience meets intelligence.",
  "careers.copy": "We are building a network of professionals who understand real environments, deploy governed artificial intelligence and accelerate business evolution.",
  "careers.consulting.title": "AI implementation consultants",
  "careers.consulting.copy": "Executives, sector specialists and experienced professionals for diagnosis, process design, implementation and AI adoption.",
  "careers.consulting.cta": "I want to work as a consultant →",
  "careers.engineering.title": "Engineering & AI",
  "careers.engineering.copy": "Software, agents, data, infrastructure, security and product for the next layer of the PatroAI ecosystem.",
  "careers.engineering.cta": "I want to build with PatroAI →",
  "careers.partnerships.title": "Commercial & Partnerships",
  "careers.partnerships.copy": "B2B consultative sales, business development and strategic relationships.",
  "careers.partnerships.cta": "I want to develop business →",
  "careers.talent.title": "Talent network",
  "careers.talent.copy": "Multidisciplinary profiles for projects, training programs and future opportunities.",
  "careers.talent.cta": "Join the talent network →",
  "careers.note": "Applications go through qualified review, consent and fit analysis for the PatroAI ecosystem.",
  "cocreator.eyebrow": "Hyper Co-Creator",
  "cocreator.title": "A creative partner to think through and build businesses with you.",
  "cocreator.copy": "One Co-Creator combines strategy, product, finance, marketing, sales, operations, technology and innovation to turn ideas and challenges into hypotheses, decisions, documents, analyses and next steps.",
  "cocreator.kicker": "One agent · multiple capabilities",
  "cocreator.note": "Files, artifacts, voice, realtime and history use the governed capabilities already available in the Platform. Evolution of the Platform itself remains restricted to the administrative plan.",
});

const STRATEGIC_WHATSAPP = "https://wa.me/5551989697605";

const CONTACT_STATUS: Record<string, string> = {
  pt: "Mensagem preparada no WhatsApp. Revise os dados e envie quando estiver pronto.",
  es: "Mensaje preparado en WhatsApp. Revisa los datos y envíalo cuando estés listo.",
  en: "Message prepared in WhatsApp. Review the details and send it when ready.",
};

const CONTACT_ERROR: Record<string, string> = {
  pt: "Revise os campos obrigatórios antes de continuar.",
  es: "Revisa los campos obligatorios antes de continuar.",
  en: "Review the required fields before continuing.",
};

type NeuralNode = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pulse: number;
};

type NeuralPointerState = {
  x: number;
  y: number;
  active: boolean;
};

type NeuralInputOptions = {
  getPointer?: () => NeuralPointerState | null;
};

export function mountPremiumLanding({
  root,
  onPrivateAccess,
  onPwaSlot,
}: PremiumLandingOptions): () => void {
  const cleanups: Array<() => void> = [];
  const timers = new Set<number>();
  const previousLang = document.documentElement.lang || "pt-BR";
  const requestedLang = new URLSearchParams(window.location.search).get("lang") || (() => {
    try {
      return window.localStorage.getItem("patroai-language") || "pt";
    } catch {
      return "pt";
    }
  })();
  let currentLang = translations[requestedLang] ? requestedLang : "pt";
  let musicEnergy = 0;
  let musicReactiveActive = false;
  const lobbyPointer: NeuralPointerState = { x: 0.5, y: 0.5, active: false };
  let lobbyPointerReleaseTimer: number | null = null;

  const query = <T extends Element>(selector: string): T | null =>
    root.querySelector<T>(selector);

  const queryAll = <T extends Element>(selector: string): T[] =>
    Array.from(root.querySelectorAll<T>(selector));

  const progress = query<HTMLElement>(".progress");
  const navLinks = query<HTMLElement>("#navLinks");
  const menuButton = query<HTMLButtonElement>("#menuButton");
  const leadForm = query<HTMLFormElement>("#leadForm");
  const formStatus = query<HTMLElement>("#formStatus");
  const screenCard = query<HTMLElement>("#screenCard");
  const langButtons = queryAll<HTMLButtonElement>("[data-lang]");
  const pwaSlot = query<HTMLElement>("#pwaInstallSlot");
  const immersiveGate = query<HTMLElement>("#immersiveGate");
  const immersiveSoundEntry = query<HTMLButtonElement>("#immersiveSoundEntry");
  const immersiveSilent = query<HTMLButtonElement>("[data-immersive-silent]");
  const immersiveDirect = query<HTMLAnchorElement>("[data-immersive-direct]");
  const copyrightToggle = query<HTMLButtonElement>("[data-copyright-toggle]");
  const copyrightPanel = query<HTMLElement>("#immersiveCopyright");
  const neuralLobby = query<HTMLElement>("#neuralLobby");
  const neuralLobbyLinks =
    queryAll<HTMLAnchorElement>("[data-neural-lobby-link]");
  const neuralLobbyBrand = query<HTMLElement>(".neural-lobby__brand");
  const neuralLobbyDragHint = query<HTMLElement>("#neuralLobbyDragHint");
  const immersiveAudio = query<HTMLAudioElement>("#patroaiImmersiveAudio");
  const musicDock = query<HTMLElement>("#musicDock");
  const musicDockToggle = query<HTMLButtonElement>("#musicDockToggle");
  const musicDockStatus = query<HTMLElement>("#musicDockStatus");
  const musicDockIcon = query<HTMLElement>("[data-music-icon]");
  const reducedMotionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  onPwaSlot?.(pwaSlot);

  function updateProgress() {
    if (!progress) return;
    const max =
      document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }

  function applyLanguage(lang: string) {
    currentLang = translations[lang] ? lang : "pt";
    document.documentElement.lang =
      currentLang === "pt" ? "pt-BR" : currentLang;

    queryAll<HTMLElement>("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      if (key && translations[currentLang]?.[key]) {
        node.textContent = translations[currentLang][key];
      }
    });

    queryAll<HTMLElement>("[data-i18n-html]").forEach((node) => {
      const key = node.dataset.i18nHtml;
      if (key && translations[currentLang]?.[key]) {
        // Translation values are immutable source-controlled strings.
        node.innerHTML = translations[currentLang][key];
      }
    });

    const localizedTitle = translations[currentLang]?.["meta.title"];
    const localizedDescription = translations[currentLang]?.["meta.description"];
    if (localizedTitle) document.title = localizedTitle;
    if (localizedDescription) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", localizedDescription);
      document.querySelector('meta[property="og:description"]')?.setAttribute("content", localizedDescription);
      document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", localizedDescription);
    }

    try {
      window.localStorage.setItem("patroai-language", currentLang);
    } catch {
      /* armazenamento indisponível: o idioma permanece nesta sessão */
    }

    const localizedUrl = new URL(window.location.href);
    if (currentLang === "pt") localizedUrl.searchParams.delete("lang");
    else localizedUrl.searchParams.set("lang", currentLang);
    const localizedHref = localizedUrl.toString();
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", localizedHref);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", localizedHref);
    window.history.replaceState(
      null,
      "",
      `${localizedUrl.pathname}${localizedUrl.search}${localizedUrl.hash}`,
    );

    langButtons.forEach((button) => {
      const isActive = button.dataset.lang === currentLang;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function animateCounts() {
    queryAll<HTMLElement>("[data-count]").forEach((item) => {
      const target = Number(item.dataset.count || 0);
      let value = 0;
      const step = Math.max(1, Math.ceil(target / 42));
      const timer = window.setInterval(() => {
        value = Math.min(target, value + step);
        item.textContent =
          target === 100
            ? `${value}%`
            : String(value).padStart(2, "0");
        if (value >= target) {
          window.clearInterval(timer);
          timers.delete(timer);
        }
      }, 24);
      timers.add(timer);
    });
  }

  function initReveal() {
    if (!("IntersectionObserver" in window)) {
      queryAll<HTMLElement>(".reveal").forEach((item) =>
        item.classList.add("visible"),
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    queryAll<HTMLElement>(".reveal").forEach((item) =>
      observer.observe(item),
    );
    cleanups.push(() => observer.disconnect());
  }

  function initPointerGlow() {
    const onWindowPointer = (event: PointerEvent) => {
      root.style.setProperty(
        "--mx",
        `${Math.round((event.clientX / window.innerWidth) * 100)}%`,
      );
      root.style.setProperty(
        "--my",
        `${Math.round((event.clientY / window.innerHeight) * 100)}%`,
      );
    };

    window.addEventListener("pointermove", onWindowPointer, {
      passive: true,
    });
    cleanups.push(() =>
      window.removeEventListener("pointermove", onWindowPointer),
    );

    if (!screenCard) return;

    const onCardPointer = (event: PointerEvent) => {
      const rect = screenCard.getBoundingClientRect();
      const x =
        ((event.clientX - rect.left) / rect.width - 0.5) * 5;
      const y =
        ((event.clientY - rect.top) / rect.height - 0.5) * -4;
      screenCard.style.setProperty(
        "--tilt-x",
        `${x.toFixed(2)}deg`,
      );
      screenCard.style.setProperty(
        "--tilt-y",
        `${y.toFixed(2)}deg`,
      );
    };

    const onCardLeave = () => {
      screenCard.style.setProperty("--tilt-x", "0deg");
      screenCard.style.setProperty("--tilt-y", "0deg");
    };

    screenCard.addEventListener("pointermove", onCardPointer);
    screenCard.addEventListener("pointerleave", onCardLeave);
    cleanups.push(() => {
      screenCard.removeEventListener("pointermove", onCardPointer);
      screenCard.removeEventListener("pointerleave", onCardLeave);
    });
  }

  function initBrainCanvas2D(
    selector = "#brainCanvas",
    densityMultiplier = 1,
    options: NeuralInputOptions = {},
  ) {
    const canvas = query<HTMLCanvasElement>(selector);
    const stage = canvas?.parentElement as HTMLElement | null;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !stage || !ctx) return;

    const nodes: NeuralNode[] = [];
    const pointer = { x: 0.5, y: 0.5, active: false };
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrame = 0;
    let inViewport = true;
    let stopped = false;

    function resize() {
      const rect = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      nodes.length = 0;
      const baseCount =
        width < 360 ? 34 : width < 720 ? 48 : 62;
      const count = Math.max(
        24,
        Math.round(baseCount * densityMultiplier),
      );

      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count;
        const radius = 0.18 + Math.random() * 0.36;
        nodes.push({
          x:
            0.5 +
            Math.cos(angle) *
              radius *
              (0.92 + Math.random() * 0.25),
          y:
            0.5 +
            Math.sin(angle) *
              radius *
              (0.72 + Math.random() * 0.28),
          vx: (Math.random() - 0.5) * 0.0012,
          vy: (Math.random() - 0.5) * 0.0012,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw(time: number, advance: boolean) {
      ctx.clearRect(0, 0, width, height);
      const t = time * 0.001;
      const externalPointer = options.getPointer?.();
      if (externalPointer?.active) {
        pointer.active = true;
        pointer.x = Math.min(1, Math.max(0, externalPointer.x));
        pointer.y = Math.min(1, Math.max(0, externalPointer.y));
      }
      const cx = width * 0.5;
      const cy = height * 0.5;
      const reactiveEnergy =
        musicReactiveActive && !reducedMotion.matches
          ? Math.min(1, Math.max(0, musicEnergy))
          : 0;
      const driftBoost = 1 + reactiveEnergy * 2.4;
      const connectionDistance = 86 + reactiveEnergy * 28;
      const connectionAlphaBoost = 1 + reactiveEnergy * 0.95;
      const nodeRadiusBoost = reactiveEnergy * 1.2;
      const haloBoost = reactiveEnergy * 9;
      const coreRadius =
        Math.min(width, height) * (0.34 + reactiveEnergy * 0.055);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      nodes.forEach((node, index) => {
        if (advance) {
          const pull = pointer.active ? 0.0009 : 0.00035;
          node.x +=
            node.vx * driftBoost +
            (0.5 - node.x) * pull +
            Math.sin(t + index) * (0.00045 * driftBoost);
          node.y +=
            node.vy * driftBoost +
            (0.5 - node.y) * pull +
            Math.cos(t * 0.8 + index) * (0.00038 * driftBoost);

          if (pointer.active) {
            const dx = pointer.x - node.x;
            const dy = pointer.y - node.y;
            const dist = Math.hypot(dx, dy) || 1;
            if (dist < 0.38) {
              node.x += dx * 0.003;
              node.y += dy * 0.003;
            }
          }

          if (node.x < 0.09 || node.x > 0.91) node.vx *= -1;
          if (node.y < 0.12 || node.y > 0.88) node.vy *= -1;
        }
      });

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const ax = a.x * width;
          const ay = a.y * height;
          const bx = b.x * width;
          const by = b.y * height;
          const dist = Math.hypot(ax - bx, ay - by);

          if (dist < connectionDistance) {
            const alpha =
              (1 - dist / connectionDistance) *
              0.38 *
              connectionAlphaBoost;
            const goldPulse =
              0.5 + Math.sin(t * 2.1 + i + j) * 0.5;
            ctx.strokeStyle = `rgba(${
              goldPulse > 0.82
                ? "217,180,95"
                : "40,240,181"
            }, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node, index) => {
        const x = node.x * width;
        const y = node.y * height;
        const glow =
          0.55 + Math.sin(t * 2.6 + node.pulse) * 0.45;
        const nearCore =
          Math.hypot(x - cx, y - cy) <
          Math.min(width, height) * 0.2;

        ctx.fillStyle = nearCore
          ? `rgba(255, 235, 176, ${0.42 + glow * 0.36})`
          : `rgba(40, 240, 181, ${0.28 + glow * 0.34})`;
        ctx.beginPath();
        ctx.arc(
          x,
          y,
          (nearCore ? 2.2 : 1.7) + nodeRadiusBoost,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        if (index % 9 === 0) {
          ctx.strokeStyle =
            `rgba(217, 180, 95, ${0.14 + glow * 0.24})`;
          ctx.beginPath();
          ctx.arc(
            x,
            y,
            8 + glow * 7 + haloBoost,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      });

      const core = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        coreRadius,
      );
      core.addColorStop(0, "rgba(255, 238, 174, 0.34)");
      core.addColorStop(0.35, "rgba(40, 240, 181, 0.14)");
      core.addColorStop(1, "rgba(40, 240, 181, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        coreRadius,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
      canvas.dataset.neuralMotion = reducedMotion.matches ? "reduced" : "running";
      canvas.dataset.neuralFrame = String(Math.floor(time / 120));
    }

    function frame(time: number) {
      if (stopped) return;

      const shouldAnimate =
        !reducedMotion.matches &&
        inViewport &&
        document.visibilityState === "visible";

      if (shouldAnimate) {
        draw(time, true);
      }

      animationFrame = window.requestAnimationFrame(frame);
    }

    function drawReducedFrame() {
      if (reducedMotion.matches && inViewport) {
        draw(performance.now(), false);
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onResize = () => {
      resize();
      if (reducedMotion.matches) drawReducedFrame();
    };

    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        reducedMotion.matches
      ) {
        drawReducedFrame();
      }
    };

    const onMotionChange = () => {
      drawReducedFrame();
    };

    resize();
    draw(performance.now(), !reducedMotion.matches);

    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener(
      "visibilitychange",
      onVisibilityChange,
    );
    reducedMotion.addEventListener("change", onMotionChange);

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          inViewport = entries.some(
            (entry) => entry.target === stage && entry.isIntersecting,
          );
          if (inViewport && reducedMotion.matches) {
            drawReducedFrame();
          }
        },
        { threshold: 0.05 },
      );
      observer.observe(stage);
    }

    animationFrame = window.requestAnimationFrame(frame);

    cleanups.push(() => {
      stopped = true;
      window.cancelAnimationFrame(animationFrame);
      observer?.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange,
      );
      reducedMotion.removeEventListener("change", onMotionChange);
      delete canvas.dataset.neuralRenderer;
      delete canvas.dataset.neuralMotion;
      delete canvas.dataset.neuralFrame;
    });
    canvas.dataset.neuralRenderer = "canvas2d";
  }

  function initLobbyLogoControl() {
    if (!neuralLobby || !neuralLobbyBrand) return;

    const position = { x: 0, y: 0 };
    const drag = {
      pointerId: null as number | null,
      startX: 0,
      startY: 0,
      originX: 0,
      originY: 0,
      active: false,
    };

    const clamp = (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value));

    const updateNeuralPointer = () => {
      const rect = neuralLobby.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      lobbyPointer.x = clamp((rect.width * 0.5 + position.x) / rect.width, 0, 1);
      lobbyPointer.y = clamp((rect.height * 0.5 + position.y) / rect.height, 0, 1);
      lobbyPointer.active = true;
    };

    const applyPosition = (x: number, y: number) => {
      const rect = neuralLobby.getBoundingClientRect();
      const halfLogo = Math.max(42, neuralLobbyBrand.offsetWidth * 0.5);
      const safeX = Math.max(24, rect.width * 0.5 - halfLogo - 18);
      const safeY = Math.max(24, rect.height * 0.5 - halfLogo - 18);
      position.x = clamp(x, -safeX, safeX);
      position.y = clamp(y, -safeY, safeY);
      neuralLobbyBrand.style.setProperty("--logo-drag-x", `${position.x.toFixed(2)}px`);
      neuralLobbyBrand.style.setProperty("--logo-drag-y", `${position.y.toFixed(2)}px`);
      updateNeuralPointer();
    };

    const releasePointer = () => {
      drag.active = false;
      neuralLobbyBrand.classList.remove("is-dragging");
      if (drag.pointerId !== null && neuralLobbyBrand.hasPointerCapture(drag.pointerId)) {
        neuralLobbyBrand.releasePointerCapture(drag.pointerId);
      }
      drag.pointerId = null;
      if (lobbyPointerReleaseTimer !== null) {
        window.clearTimeout(lobbyPointerReleaseTimer);
      }
      lobbyPointerReleaseTimer = window.setTimeout(() => {
        lobbyPointer.active = false;
        lobbyPointerReleaseTimer = null;
      }, 900);
    };

    const recenter = () => {
      applyPosition(0, 0);
      neuralLobbyBrand.classList.add("is-recentering");
      window.setTimeout(() => neuralLobbyBrand.classList.remove("is-recentering"), 260);
      if (neuralLobbyDragHint) neuralLobbyDragHint.hidden = false;
      releasePointer();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch" && event.button !== 0) return;
      drag.pointerId = event.pointerId;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
      drag.originX = position.x;
      drag.originY = position.y;
      drag.active = true;
      neuralLobbyBrand.classList.add("is-dragging");
      if (neuralLobbyDragHint) neuralLobbyDragHint.hidden = true;
      neuralLobbyBrand.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!drag.active || drag.pointerId !== event.pointerId) return;
      applyPosition(
        drag.originX + event.clientX - drag.startX,
        drag.originY + event.clientY - drag.startY,
      );
      event.preventDefault();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (drag.pointerId !== event.pointerId) return;
      releasePointer();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Home" || event.key === "Escape") {
        event.preventDefault();
        recenter();
        return;
      }
      const step = event.shiftKey ? 28 : 14;
      const offsets: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const offset = offsets[event.key];
      if (!offset) return;
      event.preventDefault();
      applyPosition(position.x + offset[0], position.y + offset[1]);
      if (neuralLobbyDragHint) neuralLobbyDragHint.hidden = true;
    };

    neuralLobbyBrand.addEventListener("pointerdown", onPointerDown);
    neuralLobbyBrand.addEventListener("pointermove", onPointerMove);
    neuralLobbyBrand.addEventListener("pointerup", onPointerUp);
    neuralLobbyBrand.addEventListener("pointercancel", onPointerUp);
    neuralLobbyBrand.addEventListener("keydown", onKeyDown);
    neuralLobbyBrand.addEventListener("dblclick", recenter);
    applyPosition(0, 0);

    cleanups.push(() => {
      if (lobbyPointerReleaseTimer !== null) {
        window.clearTimeout(lobbyPointerReleaseTimer);
      }
      neuralLobbyBrand.removeEventListener("pointerdown", onPointerDown);
      neuralLobbyBrand.removeEventListener("pointermove", onPointerMove);
      neuralLobbyBrand.removeEventListener("pointerup", onPointerUp);
      neuralLobbyBrand.removeEventListener("pointercancel", onPointerUp);
      neuralLobbyBrand.removeEventListener("keydown", onKeyDown);
      neuralLobbyBrand.removeEventListener("dblclick", recenter);
      neuralLobbyBrand.style.removeProperty("--logo-drag-x");
      neuralLobbyBrand.style.removeProperty("--logo-drag-y");
      lobbyPointer.active = false;
    });
  }

  function initBrainCanvas(
    selector = "#brainCanvas",
    densityMultiplier = 1,
    options: NeuralInputOptions = {},
  ) {
    const canvas = query<HTMLCanvasElement>(selector);
    const stage = canvas?.parentElement as HTMLElement | null;
    if (!canvas || !stage) return;

    const webgl = initNeuralWebgl(canvas, stage, {
      getEnergy: () => musicEnergy,
      getReactive: () => musicReactiveActive,
      getPointer: options.getPointer,
    });

    if (!webgl) {
      initBrainCanvas2D(selector, densityMultiplier, options);
      return;
    }

    canvas.dataset.neuralRenderer = "webgl2";
    let inViewport = true;
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            inViewport = entries.some(
              (entry) => entry.target === stage && entry.isIntersecting,
            );
            webgl.setViewport(inViewport);
          },
          { threshold: 0.05 },
        )
      : null;
    observer?.observe(stage);

    cleanups.push(() => {
      observer?.disconnect();
      webgl.destroy();
      delete canvas.dataset.neuralRenderer;
    });
  }

  if (menuButton && navLinks) {
    const onMenu = () => {
      const open = navLinks.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    };
    const onNavClick = (event: Event) => {
      if ((event.target as Element | null)?.matches("a")) {
        navLinks.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    };

    menuButton.addEventListener("click", onMenu);
    navLinks.addEventListener("click", onNavClick);
    cleanups.push(() => {
      menuButton.removeEventListener("click", onMenu);
      navLinks.removeEventListener("click", onNavClick);
    });
  }

  langButtons.forEach((button) => {
    const onLanguage = () =>
      applyLanguage(button.dataset.lang || "pt");
    button.addEventListener("click", onLanguage);
    cleanups.push(() =>
      button.removeEventListener("click", onLanguage),
    );
  });

  applyLanguage(currentLang);

  if (immersiveGate) {
    document.body.classList.add("immersive-gate-open");

    const openNeuralLobby = () => {
      if (!neuralLobby) return;
      neuralLobby.classList.remove("is-exiting");
      neuralLobby.classList.add("is-active");
      neuralLobby.setAttribute("aria-hidden", "false");
      document.body.classList.add("neural-lobby-open");
      window.setTimeout(() => neuralLobbyLinks[0]?.focus(), 40);
    };

    const closeImmersiveGate = () => {
      immersiveGate.classList.add("is-leaving");
      window.setTimeout(() => {
        immersiveGate.hidden = true;
        document.body.classList.remove("immersive-gate-open");
        openNeuralLobby();
      }, 520);
    };

    const enterPresentationDirectly = (event?: Event) => {
      event?.preventDefault();
      immersiveGate.classList.add("is-leaving");
      window.setTimeout(() => {
        immersiveGate.hidden = true;
        document.body.classList.remove("immersive-gate-open");
        neuralLobby?.classList.remove("is-active");
        neuralLobby?.setAttribute("aria-hidden", "true");
        document.body.classList.remove("neural-lobby-open");
        document.querySelector<HTMLElement>("#top")?.scrollIntoView({
          behavior: reducedMotionPreference.matches ? "auto" : "smooth",
          block: "start",
        });
      }, 520);
    };

    const closeNeuralLobby = (targetSelector?: string) => {
      if (!neuralLobby) return;
      neuralLobby.classList.add("is-exiting");
      neuralLobby.classList.remove("is-active");
      neuralLobby.setAttribute("aria-hidden", "true");

      window.setTimeout(() => {
        document.body.classList.remove("neural-lobby-open");
        if (!targetSelector) return;
        const target = document.querySelector<HTMLElement>(
          targetSelector,
        );
        target?.scrollIntoView({
          behavior: reducedMotionPreference.matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      }, 680);
    };

    const syncMusicDock = () => {
      if (!immersiveAudio || !musicDock) return;
      musicDock.hidden = false;
      const paused = immersiveAudio.paused;
      if (musicDockIcon) musicDockIcon.textContent = paused ? "▶" : "Ⅱ";
      if (musicDockToggle) {
        musicDockToggle.setAttribute(
          "aria-label",
          paused ? "Reproduzir música" : "Pausar música",
        );
      }
      if (musicDockStatus) {
        musicDockStatus.textContent = immersiveAudio.ended
          ? "Obra concluída"
          : paused
            ? "Experiência sonora pausada"
            : "Reproduzindo obra imersiva";
      }
    };

    let audioContext: AudioContext | null = null;
    let audioAnalyser: AnalyserNode | null = null;
    let audioReactiveFrame = 0;
    let audioReactiveLevel = 0;
    let audioReactiveReady = false;

    const resetAudioReactiveLogo = () => {
      if (audioReactiveFrame) {
        window.cancelAnimationFrame(audioReactiveFrame);
        audioReactiveFrame = 0;
      }
      audioReactiveLevel = 0;
      musicEnergy = 0;
      musicReactiveActive = false;
      root.classList.remove("music-reactive-active");
      root.style.removeProperty("--music-logo-scale");
      root.style.removeProperty("--music-logo-lift");
      root.style.removeProperty("--music-logo-glow");
      root.style.removeProperty("--music-aura-scale");
      root.style.removeProperty("--music-aura-opacity");
      root.style.removeProperty("--music-dock-energy");
    };

    const renderAudioReactiveLogo = () => {
      if (
        !immersiveAudio ||
        !audioAnalyser ||
        immersiveAudio.paused ||
        immersiveAudio.ended ||
        reducedMotionPreference.matches
      ) {
        resetAudioReactiveLogo();
        return;
      }

      const frequencyData = new Uint8Array(
        audioAnalyser.frequencyBinCount,
      );
      audioAnalyser.getByteFrequencyData(frequencyData);

      // Use the lower ~60% of bins: enough musical body to feel the track
      // without making the logo jitter on every high-frequency transient.
      const usefulBins = Math.max(
        1,
        Math.floor(frequencyData.length * 0.6),
      );
      let energyTotal = 0;
      for (let index = 0; index < usefulBins; index += 1) {
        energyTotal += frequencyData[index];
      }

      const rawEnergy =
        energyTotal / usefulBins / 255;

      // Faster attack, slower release keeps the motion musical rather than noisy.
      const smoothing =
        rawEnergy > audioReactiveLevel ? 0.34 : 0.12;
      audioReactiveLevel +=
        (rawEnergy - audioReactiveLevel) * smoothing;

      const normalized = Math.min(
        1,
        Math.max(0, audioReactiveLevel * 1.8),
      );
      musicEnergy = normalized;
      musicReactiveActive = true;
      const scale = 1 + normalized * 0.085;
      const lift = -normalized * 3.2;
      const glow = 0.32 + normalized * 0.62;
      const auraScale = 0.98 + normalized * 0.18;
      const auraOpacity = 0.58 + normalized * 0.4;

      root.classList.add("music-reactive-active");
      root.style.setProperty(
        "--music-logo-scale",
        scale.toFixed(4),
      );
      root.style.setProperty(
        "--music-logo-lift",
        `${lift.toFixed(2)}px`,
      );
      root.style.setProperty(
        "--music-logo-glow",
        glow.toFixed(3),
      );
      root.style.setProperty(
        "--music-aura-scale",
        auraScale.toFixed(4),
      );
      root.style.setProperty(
        "--music-aura-opacity",
        auraOpacity.toFixed(3),
      );
      root.style.setProperty(
        "--music-dock-energy",
        normalized.toFixed(3),
      );

      audioReactiveFrame = window.requestAnimationFrame(
        renderAudioReactiveLogo,
      );
    };

    const ensureAudioReactiveLogo = async () => {
      if (
        !immersiveAudio ||
        reducedMotionPreference.matches ||
        audioReactiveReady
      ) {
        return;
      }

      const AudioContextClass =
        window.AudioContext ||
        (
          window as Window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) return;

      try {
        audioContext = new AudioContextClass();
        const source =
          audioContext.createMediaElementSource(immersiveAudio);
        audioAnalyser = audioContext.createAnalyser();
        audioAnalyser.fftSize = 256;
        audioAnalyser.smoothingTimeConstant = 0.72;
        source.connect(audioAnalyser);
        audioAnalyser.connect(audioContext.destination);
        audioReactiveReady = true;

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }
      } catch {
        // Audio playback remains functional even if visual analysis is unavailable.
        audioAnalyser = null;
        audioReactiveReady = false;
      }
    };

    const startAudioReactiveLogo = () => {
      if (
        !audioAnalyser ||
        !immersiveAudio ||
        immersiveAudio.paused ||
        reducedMotionPreference.matches
      ) {
        resetAudioReactiveLogo();
        return;
      }
      if (audioReactiveFrame) {
        window.cancelAnimationFrame(audioReactiveFrame);
      }
      audioReactiveFrame = window.requestAnimationFrame(
        renderAudioReactiveLogo,
      );
    };

    if (immersiveSoundEntry && immersiveAudio) {
      const onSoundEntry = async () => {
        try {
          immersiveAudio.currentTime = 0;
          await ensureAudioReactiveLogo();
          if (audioContext?.state === "suspended") {
            await audioContext.resume();
          }
          await immersiveAudio.play();
          syncMusicDock();
          startAudioReactiveLogo();
        } catch {
          if (musicDockStatus) {
            musicDockStatus.textContent =
              "Experiência sonora indisponível; seguindo sem áudio.";
          }
          if (musicDock) musicDock.hidden = false;
        } finally {
          // Audio is optional. The neural lobby must never be blocked by
          // autoplay policy, missing media, or an unavailable analyser.
          syncMusicDock();
          closeImmersiveGate();
        }
      };
      immersiveSoundEntry.addEventListener("click", onSoundEntry);
      cleanups.push(() =>
        immersiveSoundEntry.removeEventListener("click", onSoundEntry),
      );
    } else if (immersiveSoundEntry) {
      const onSoundEntryWithoutAudio = () => closeImmersiveGate();
      immersiveSoundEntry.addEventListener(
        "click",
        onSoundEntryWithoutAudio,
      );
      cleanups.push(() =>
        immersiveSoundEntry.removeEventListener(
          "click",
          onSoundEntryWithoutAudio,
        ),
      );
    }

    if (immersiveSilent) {
      const onSilentEntry = () => {
        if (immersiveAudio) {
          immersiveAudio.pause();
          immersiveAudio.currentTime = 0;
        }
        resetAudioReactiveLogo();
        if (musicDock) musicDock.hidden = true;
        closeImmersiveGate();
      };
      immersiveSilent.addEventListener("click", onSilentEntry);
      cleanups.push(() =>
        immersiveSilent.removeEventListener("click", onSilentEntry),
      );
    }

    if (immersiveDirect) {
      immersiveDirect.addEventListener("click", enterPresentationDirectly);
      cleanups.push(() =>
        immersiveDirect.removeEventListener("click", enterPresentationDirectly),
      );
    }

    const onGateKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") enterPresentationDirectly(event);
    };
    document.addEventListener("keydown", onGateKeyDown);
    cleanups.push(() => document.removeEventListener("keydown", onGateKeyDown));
    window.setTimeout(() => immersiveSoundEntry?.focus(), 40);

    if (immersiveAudio && musicDockToggle) {
      const onMusicToggle = async () => {
        if (immersiveAudio.paused) {
          try {
            await ensureAudioReactiveLogo();
            if (audioContext?.state === "suspended") {
              await audioContext.resume();
            }
            await immersiveAudio.play();
            startAudioReactiveLogo();
          } catch {
            // Browser playback policy/error remains visible through dock state.
          }
        } else {
          immersiveAudio.pause();
          resetAudioReactiveLogo();
        }
        syncMusicDock();
      };
      const onPlay = () => {
        syncMusicDock();
        startAudioReactiveLogo();
      };
      const onPause = () => {
        syncMusicDock();
        resetAudioReactiveLogo();
      };
      const onEnded = () => {
        syncMusicDock();
        resetAudioReactiveLogo();
      };

      musicDockToggle.addEventListener("click", onMusicToggle);
      immersiveAudio.addEventListener("play", onPlay);
      immersiveAudio.addEventListener("pause", onPause);
      immersiveAudio.addEventListener("ended", onEnded);

      cleanups.push(() => {
        musicDockToggle.removeEventListener("click", onMusicToggle);
        immersiveAudio.removeEventListener("play", onPlay);
        immersiveAudio.removeEventListener("pause", onPause);
        immersiveAudio.removeEventListener("ended", onEnded);
        immersiveAudio.pause();
        resetAudioReactiveLogo();
        if (audioContext && audioContext.state !== "closed") {
          void audioContext.close();
        }
      });
    }

    neuralLobbyLinks.forEach((anchor) => {
      const onLobbyLink = (event: MouseEvent) => {
        const href = anchor.getAttribute("href") || "";
        if (href.startsWith("#")) {
          event.preventDefault();
          closeNeuralLobby(href);
          return;
        }

        // For canonical private access, let the existing auth handler own
        // navigation while this visual layer exits.
        closeNeuralLobby();
      };

      anchor.addEventListener("click", onLobbyLink);
      cleanups.push(() =>
        anchor.removeEventListener("click", onLobbyLink),
      );
    });

    if (copyrightToggle && copyrightPanel) {
      const onCopyrightToggle = () => {
        const expanded =
          copyrightToggle.getAttribute("aria-expanded") === "true";
        copyrightToggle.setAttribute(
          "aria-expanded",
          String(!expanded),
        );
        copyrightPanel.hidden = expanded;
      };
      copyrightToggle.addEventListener(
        "click",
        onCopyrightToggle,
      );
      cleanups.push(() =>
        copyrightToggle.removeEventListener(
          "click",
          onCopyrightToggle,
        ),
      );
    }

    cleanups.push(() => {
      document.body.classList.remove("immersive-gate-open");
      document.body.classList.remove("neural-lobby-open");
    });
  }

  queryAll<HTMLAnchorElement>("[data-private-entry]").forEach(
    (anchor) => {
      const onClick = (event: MouseEvent) => {
        event.preventDefault();
        void Promise.resolve(onPrivateAccess());
      };
      anchor.addEventListener("click", onClick);
      cleanups.push(() =>
        anchor.removeEventListener("click", onClick),
      );
    },
  );

  if (leadForm && formStatus) {
    const onSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      const data = new FormData(leadForm);
      const name = String(data.get("nome") || "").trim();
      const email = String(data.get("email") || "").trim();
      const profile = String(data.get("perfil") || "").trim();
      const whatsapp = String(data.get("whatsapp") || "").trim();
      const challenge = String(data.get("mensagem") || "").trim();

      if (!name || !email || !profile || !whatsapp || !challenge) {
        formStatus.textContent = CONTACT_ERROR[currentLang] || CONTACT_ERROR.pt;
        return;
      }

      const message = [
        "Olá, Grupo PatroAI. Gostaria de falar sobre uma oportunidade estratégica.",
        "",
        `Nome: ${name}`,
        `E-mail: ${email}`,
        `Perfil: ${profile}`,
        `WhatsApp: ${whatsapp}`,
        `Contexto: ${challenge}`,
      ].join("\\n");
      const destination = new URL(STRATEGIC_WHATSAPP);
      destination.searchParams.set("text", message);
      window.open(destination.toString(), "_blank", "noopener,noreferrer");
      formStatus.textContent = CONTACT_STATUS[currentLang] || CONTACT_STATUS.pt;
      leadForm.reset();
    };
    leadForm.addEventListener("submit", onSubmit);
    cleanups.push(() =>
      leadForm.removeEventListener("submit", onSubmit),
    );
  }

  const onScroll = () => updateProgress();
  window.addEventListener("scroll", onScroll, { passive: true });
  cleanups.push(() =>
    window.removeEventListener("scroll", onScroll),
  );

  updateProgress();
  animateCounts();
  initReveal();
  initPointerGlow();
  initLobbyLogoControl();
  initBrainCanvas();
  initBrainCanvas("#lobbyBrainCanvas", 1.45, {
    getPointer: () => (lobbyPointer.active ? lobbyPointer : null),
  });

  return () => {
    timers.forEach((timer) => window.clearInterval(timer));
    timers.clear();
    cleanups.reverse().forEach((cleanup) => cleanup());
    document.documentElement.lang = previousLang;
    root.style.removeProperty("--mx");
    root.style.removeProperty("--my");
    onPwaSlot?.(null);
  };
}
