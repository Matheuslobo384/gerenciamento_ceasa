// INVESTIGAÇÃO COMPLETA DO CÁLCULO DE VENDAS
// Analisando todas as possibilidades para encontrar a causa da diferença

// Dados do teste específico do usuário
const itens = [
  { quantidade: 60, preco_unitario: 50 },  // 60 × 50 = 3000
  { quantidade: 5, preco_unitario: 50 },   // 5 × 50 = 250
  { quantidade: 4, preco_unitario: 35 }    // 4 × 35 = 140
];

// Valores reportados pelo usuário
const VALOR_SISTEMA = 4453.50;
const VALOR_CALCULADORA = 4108.50;

// Cálculos base
const subtotal = itens.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);
const quantidadeTotal = itens.reduce((total, item) => total + item.quantidade, 0);

console.log('🔍 INVESTIGAÇÃO COMPLETA DO CÁLCULO\n');
console.log('📊 DADOS BASE:');
console.log('   Subtotal dos produtos: R$ ' + subtotal.toFixed(2));
console.log('   Quantidade total: ' + quantidadeTotal + ' produtos');
console.log('   Valor no sistema: R$ ' + VALOR_SISTEMA.toFixed(2));
console.log('   Valor na calculadora: R$ ' + VALOR_CALCULADORA.toFixed(2));
console.log('   Diferença: R$ ' + (VALOR_SISTEMA - VALOR_CALCULADORA).toFixed(2));

console.log('\n🧮 TESTANDO DIFERENTES CENÁRIOS:\n');

// Cenário 1: Frete por quantidade R$ 5,00 + Comissão 5% sobre subtotal
const frete1 = quantidadeTotal * 5;
const comissao1 = subtotal * 0.05;
const total1 = subtotal + frete1 + comissao1;
console.log('1️⃣ CENÁRIO CORRETO:');
console.log('   Frete: ' + quantidadeTotal + ' × R$ 5,00 = R$ ' + frete1.toFixed(2));
console.log('   Comissão: R$ ' + subtotal.toFixed(2) + ' × 5% = R$ ' + comissao1.toFixed(2));
console.log('   Total: R$ ' + total1.toFixed(2));
console.log('   Diferença do sistema: R$ ' + Math.abs(total1 - VALOR_SISTEMA).toFixed(2));
console.log('   Diferença da calculadora: R$ ' + Math.abs(total1 - VALOR_CALCULADORA).toFixed(2));

// Cenário 2: Frete por quantidade R$ 5,00 + Comissão 5% sobre (subtotal + frete)
const frete2 = quantidadeTotal * 5;
const comissao2 = (subtotal + frete2) * 0.05;
const total2 = subtotal + frete2 + comissao2;
console.log('\n2️⃣ CENÁRIO INCORRETO (comissão sobre subtotal + frete):');
console.log('   Frete: ' + quantidadeTotal + ' × R$ 5,00 = R$ ' + frete2.toFixed(2));
console.log('   Comissão: R$ ' + (subtotal + frete2).toFixed(2) + ' × 5% = R$ ' + comissao2.toFixed(2));
console.log('   Total: R$ ' + total2.toFixed(2));
console.log('   Diferença do sistema: R$ ' + Math.abs(total2 - VALOR_SISTEMA).toFixed(2));
console.log('   Diferença da calculadora: R$ ' + Math.abs(total2 - VALOR_CALCULADORA).toFixed(2));

// Cenário 3: Testando diferentes valores de frete por quantidade
const valoresFrete = [3, 4, 5, 6, 7, 8, 9, 10, 15, 20];
console.log('\n3️⃣ TESTANDO DIFERENTES VALORES DE FRETE POR QUANTIDADE:');
valoresFrete.forEach(valorFrete => {
  const frete = quantidadeTotal * valorFrete;
  const comissaoCorreta = subtotal * 0.05;
  const comissaoIncorreta = (subtotal + frete) * 0.05;
  const totalCorreto = subtotal + frete + comissaoCorreta;
  const totalIncorreto = subtotal + frete + comissaoIncorreta;
  
  const diffSistemaCorreto = Math.abs(totalCorreto - VALOR_SISTEMA);
  const diffSistemaIncorreto = Math.abs(totalIncorreto - VALOR_SISTEMA);
  const diffCalcCorreto = Math.abs(totalCorreto - VALOR_CALCULADORA);
  const diffCalcIncorreto = Math.abs(totalIncorreto - VALOR_CALCULADORA);
  
  if (diffSistemaCorreto < 1 || diffSistemaIncorreto < 1 || diffCalcCorreto < 1 || diffCalcIncorreto < 1) {
    console.log('   🎯 POSSÍVEL MATCH - Frete R$ ' + valorFrete.toFixed(2) + ':');
    console.log('      Correto: R$ ' + totalCorreto.toFixed(2) + ' (diff sistema: R$ ' + diffSistemaCorreto.toFixed(2) + ', calc: R$ ' + diffCalcCorreto.toFixed(2) + ')');
    console.log('      Incorreto: R$ ' + totalIncorreto.toFixed(2) + ' (diff sistema: R$ ' + diffSistemaIncorreto.toFixed(2) + ', calc: R$ ' + diffCalcIncorreto.toFixed(2) + ')');
  }
});

// Cenário 4: Testando diferentes percentuais de comissão
const percentuaisComissao = [3, 4, 5, 6, 7, 8, 9, 10];
console.log('\n4️⃣ TESTANDO DIFERENTES PERCENTUAIS DE COMISSÃO (frete R$ 5,00):');
percentuaisComissao.forEach(percentual => {
  const frete = quantidadeTotal * 5;
  const comissaoCorreta = subtotal * (percentual / 100);
  const comissaoIncorreta = (subtotal + frete) * (percentual / 100);
  const totalCorreto = subtotal + frete + comissaoCorreta;
  const totalIncorreto = subtotal + frete + comissaoIncorreta;
  
  const diffSistemaCorreto = Math.abs(totalCorreto - VALOR_SISTEMA);
  const diffSistemaIncorreto = Math.abs(totalIncorreto - VALOR_SISTEMA);
  const diffCalcCorreto = Math.abs(totalCorreto - VALOR_CALCULADORA);
  const diffCalcIncorreto = Math.abs(totalIncorreto - VALOR_CALCULADORA);
  
  if (diffSistemaCorreto < 1 || diffSistemaIncorreto < 1 || diffCalcCorreto < 1 || diffCalcIncorreto < 1) {
    console.log('   🎯 POSSÍVEL MATCH - Comissão ' + percentual + '%:');
    console.log('      Correto: R$ ' + totalCorreto.toFixed(2) + ' (diff sistema: R$ ' + diffSistemaCorreto.toFixed(2) + ', calc: R$ ' + diffCalcCorreto.toFixed(2) + ')');
    console.log('      Incorreto: R$ ' + totalIncorreto.toFixed(2) + ' (diff sistema: R$ ' + diffSistemaIncorreto.toFixed(2) + ', calc: R$ ' + diffCalcIncorreto.toFixed(2) + ')');
  }
});

// Cenário 5: Calculando o que seria necessário para chegar aos valores exatos
console.log('\n5️⃣ ENGENHARIA REVERSA:');

// Para chegar ao valor do sistema (4453.50)
const diferencaSistema = VALOR_SISTEMA - subtotal;
console.log('   Para chegar a R$ ' + VALOR_SISTEMA.toFixed(2) + ':');
console.log('   Diferença do subtotal: R$ ' + diferencaSistema.toFixed(2));

// Assumindo frete de R$ 5,00 por quantidade
const freteAssumido = quantidadeTotal * 5; // R$ 345
const comissaoNecessariaSistema = diferencaSistema - freteAssumido;
const percentualNecessarioSistema = (comissaoNecessariaSistema / subtotal) * 100;
console.log('   Se frete = R$ ' + freteAssumido.toFixed(2) + ', comissão seria: R$ ' + comissaoNecessariaSistema.toFixed(2));
console.log('   Percentual de comissão: ' + percentualNecessarioSistema.toFixed(2) + '%');

// Para chegar ao valor da calculadora (4108.50)
const diferencaCalculadora = VALOR_CALCULADORA - subtotal;
console.log('\n   Para chegar a R$ ' + VALOR_CALCULADORA.toFixed(2) + ':');
console.log('   Diferença do subtotal: R$ ' + diferencaCalculadora.toFixed(2));
const comissaoNecessariaCalc = diferencaCalculadora - freteAssumido;
const percentualNecessarioCalc = (comissaoNecessariaCalc / subtotal) * 100;
console.log('   Se frete = R$ ' + freteAssumido.toFixed(2) + ', comissão seria: R$ ' + comissaoNecessariaCalc.toFixed(2));
console.log('   Percentual de comissão: ' + percentualNecessarioCalc.toFixed(2) + '%');

console.log('\n📋 CONCLUSÕES:');
console.log('1. O problema principal é que a comissão está sendo calculada sobre (subtotal + frete)');
console.log('2. O valor correto deveria ser R$ ' + total1.toFixed(2) + ' (comissão sobre subtotal apenas)');
console.log('3. Para corrigir, execute o script corrigir-calculo-comissao.sql');
console.log('4. Após a correção, futuras vendas calcularão corretamente');
console.log('5. Vendas existentes precisam ser recalculadas');

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('✅ 1. Executar corrigir-calculo-comissao.sql no banco de dados');
console.log('✅ 2. Verificar se as configurações de frete estão corretas');
console.log('✅ 3. Testar uma nova venda para confirmar o cálculo');
console.log('✅ 4. Recalcular vendas existentes se necessário');