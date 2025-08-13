const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase - substitua pelas suas credenciais
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuração do banco de dados...');
    
    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, 'database_setup_complete.sql');
    const sqlScript = fs.readFileSync(sqlFile, 'utf8');
    
    // Dividir o script em comandos individuais
    const commands = sqlScript
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.trim()) {
        try {
          console.log(`⚡ Executando comando ${i + 1}/${commands.length}...`);
          
          // Usar rpc para executar SQL raw
          const { error } = await supabase.rpc('exec_sql', { 
            sql_query: command + ';' 
          });
          
          if (error) {
            console.error(`❌ Erro no comando ${i + 1}:`, error);
            // Continuar mesmo com erro (algumas operações podem falhar se já existirem)
          }
        } catch (err) {
          console.error(`❌ Erro inesperado no comando ${i + 1}:`, err);
        }
      }
    }
    
    console.log('✅ Configuração do banco concluída!');
    console.log('📊 Verificando tabelas criadas...');
    
    // Verificar se as tabelas foram criadas
    const tables = ['configuracoes', 'profiles', 'clientes', 'produtos', 'vendas', 'itens_venda'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Tabela ${table} criada com sucesso`);
        } else {
          console.log(`❌ Problema com tabela ${table}:`, error.message);
        }
      } catch (err) {
        console.log(`❌ Erro ao verificar tabela ${table}:`, err.message);
      }
    }
    
    console.log('\n🎉 Sistema de banco de dados configurado!');
    console.log('📋 Recursos incluídos:');
    console.log('   • Sistema de frete (por produto, por pedido, por quantidade)');
    console.log('   • Sistema de comissão automática (despesas)');
    console.log('   • Tabelas: clientes, produtos, vendas, itens_venda');
    console.log('   • Configurações do sistema');
    console.log('   • Perfis de usuário');
    console.log('   • Triggers e funções automáticas');
    console.log('   • Índices para performance');
    console.log('   • Políticas de segurança (RLS)');
    
  } catch (error) {
    console.error('💥 Erro geral na configuração:', error);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };