const markdownpdf = require('markdown-pdf');
const fs = require('fs');
const path = require('path');

// Configurações para o PDF
const options = {
  "paperFormat": "A4",
  "paperOrientation": "portrait",
  "paperBorder": {
    "top": "1in",
    "right": "1in",
    "bottom": "1in",
    "left": "1in"
  },
  "renderDelay": 1000,
  "loadTimeout": 10000,
  "cssPath": path.join(__dirname, "pdf-styles.css")
};

// Função para gerar PDF
function generatePDF() {
  const inputPath = path.join(__dirname, 'DOCUMENTACAO_COMPLETA.md');
  const outputPath = path.join(__dirname, 'DOCUMENTACAO_COMPLETA_SISTEMA_AGROPECUARIO.pdf');

  console.log('🔄 Iniciando conversão de Markdown para PDF...');
  console.log(`📄 Arquivo origem: ${inputPath}`);
  console.log(`📋 Arquivo destino: ${outputPath}`);

  // Verificar se o arquivo de entrada existe
  if (!fs.existsSync(inputPath)) {
    console.error('❌ Erro: Arquivo DOCUMENTACAO_COMPLETA.md não encontrado!');
    return;
  }

  markdownpdf(options)
    .from(inputPath)
    .to(outputPath, function(err) {
      if (err) {
        console.error('❌ Erro ao gerar PDF:', err);
        return;
      }
      
      console.log('✅ PDF gerado com sucesso!');
      console.log(`📁 Localização: ${outputPath}`);
      console.log('🎉 Documentação completa está pronta!');
      
      // Exibir informações do arquivo
      const stats = fs.statSync(outputPath);
      const fileSizeInBytes = stats.size;
      const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
      
      console.log(`📊 Tamanho do arquivo: ${fileSizeInMB} MB`);
      console.log(`📅 Data de criação: ${stats.birthtime}`);
    });
}

// Executar a função
generatePDF();
