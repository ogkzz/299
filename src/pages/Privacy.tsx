import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />
      <main className="container mx-auto px-6 pt-28 pb-20 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold gradient-text mb-8">Política de Privacidade</h1>
          <div className="glass-panel rounded-2xl p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-foreground font-medium text-base mb-2">1. Coleta de Dados</h2>
              <p>O 299 processa os dados do App Privacy Report exclusivamente no navegador do usuário. Nenhum dado é enviado ou armazenado em servidores externos durante a análise.</p>
            </section>
            <section>
              <h2 className="text-foreground font-medium text-base mb-2">2. Processamento Local</h2>
              <p>Toda a análise é realizada client-side (no dispositivo do usuário). Os arquivos enviados não são transmitidos pela rede e permanecem apenas na memória do navegador durante a sessão.</p>
            </section>
            <section>
              <h2 className="text-foreground font-medium text-base mb-2">3. Dados Pessoais</h2>
              <p>Não coletamos, armazenamos ou compartilhamos dados pessoais dos usuários. O endereço IP informado é utilizado apenas localmente para fins de análise.</p>
            </section>
            <section>
              <h2 className="text-foreground font-medium text-base mb-2">4. Cookies</h2>
              <p>A plataforma pode utilizar cookies essenciais para funcionamento. Nenhum cookie de rastreamento ou marketing é utilizado.</p>
            </section>
            <section>
              <h2 className="text-foreground font-medium text-base mb-2">5. Segurança</h2>
              <p>Implementamos práticas de segurança avançadas para proteger a integridade da plataforma e garantir a privacidade dos usuários.</p>
            </section>
            <section>
              <h2 className="text-foreground font-medium text-base mb-2">6. Contato</h2>
              <p>Para questões relacionadas à privacidade, entre em contato através da plataforma.</p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
