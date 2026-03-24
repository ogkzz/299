import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />
      <main className="container mx-auto px-6 pt-28 pb-20 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold gradient-text mb-8">Termos de Uso</h1>
          <div className="glass-panel rounded-2xl p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-foreground font-medium text-base mb-2">1. Aceitação dos Termos</h2>
              <p>Ao acessar e utilizar a plataforma 299, você concorda com estes termos de uso. Se não concordar, não utilize o serviço.</p>
            </section>
            <section>
              <h2 className="text-foreground font-medium text-base mb-2">2. Descrição do Serviço</h2>
              <p>O 299 é uma ferramenta de análise de relatórios de privacidade do iOS (App Privacy Report) para identificação de atividades suspeitas como uso de proxy, VPN, VPS e interceptação de tráfego.</p>
            </section>
            <section>
              <h2 className="text-foreground font-medium text-base mb-2">3. Uso Responsável</h2>
              <p>O usuário é responsável pelo uso ético e legal da plataforma. O serviço não deve ser utilizado para fins ilegais, invasão de privacidade de terceiros sem consentimento ou qualquer atividade que viole leis locais.</p>
            </section>
            <section>
              <h2 className="text-foreground font-medium text-base mb-2">4. Limitação de Responsabilidade</h2>
              <p>Os resultados fornecidos são indicativos e baseados em análise heurística. O 299 não garante 100% de precisão e não se responsabiliza por decisões tomadas com base nos resultados.</p>
            </section>
            <section>
              <h2 className="text-foreground font-medium text-base mb-2">5. Propriedade Intelectual</h2>
              <p>Todo o conteúdo, código e design da plataforma 299 são protegidos por direitos autorais. Reprodução sem autorização é proibida.</p>
            </section>
            <section>
              <h2 className="text-foreground font-medium text-base mb-2">6. Modificações</h2>
              <p>Reservamos o direito de modificar estes termos a qualquer momento. Alterações serão comunicadas através da plataforma.</p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
