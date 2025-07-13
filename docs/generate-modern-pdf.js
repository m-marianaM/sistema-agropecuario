const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');

async function generateModernPDF() {
  try {
    console.log('🚀 Iniciando geração de PDF moderno...');
    
    const inputPath = path.join(__dirname, 'DOCUMENTACAO_COMPLETA.md');
    const outputPath = path.join(__dirname, 'DOCUMENTACAO_SISTEMA_AGROPECUARIO_MODERNA.pdf');

    // Configurações avançadas para o PDF
    const pdfOptions = {
      dest: outputPath,
      pdf_options: {
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center; color: #666;">Sistema Agropecuário - Documentação Técnica</div>',
        footerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center; color: #666;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
      },
      stylesheet: [
        'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css',
        path.join(__dirname, 'pdf-styles.css')
      ],
      body_class: 'markdown-body',
      css: `
        .markdown-body {
          max-width: none;
          padding: 20px;
        }
        
        h1 {
          color: #2c3e50;
          border-bottom: 3px solid #3498db;
          padding-bottom: 10px;
          page-break-before: always;
        }
        
        h1:first-of-type {
          page-break-before: auto;
        }
        
        h2 {
          color: #27ae60;
          border-bottom: 2px solid #27ae60;
          padding-bottom: 8px;
          margin-top: 30px;
        }
        
        h3 {
          color: #e74c3c;
          margin-top: 25px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 14px;
        }
        
        table th {
          background-color: #3498db;
          color: white;
          padding: 12px;
          text-align: left;
          border: 1px solid #2980b9;
        }
        
        table td {
          padding: 10px;
          border: 1px solid #bdc3c7;
        }
        
        table tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        pre {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 5px;
          padding: 15px;
          overflow-x: auto;
          margin: 15px 0;
          font-size: 12px;
        }
        
        code {
          background-color: #f8f9fa;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #e74c3c;
        }
        
        .page-break {
          page-break-before: always;
        }
      `
    };

    // Verificar se o arquivo existe
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Erro: Arquivo DOCUMENTACAO_COMPLETA.md não encontrado!');
      return;
    }

    console.log(`📄 Convertendo: ${inputPath}`);
    console.log(`📋 Destino: ${outputPath}`);

    const pdf = await mdToPdf({ path: inputPath }, pdfOptions);

    if (pdf) {
      console.log('✅ PDF moderno gerado com sucesso!');
      console.log(`📁 Localização: ${outputPath}`);
      
      // Informações do arquivo
      const stats = fs.statSync(outputPath);
      const fileSizeInBytes = stats.size;
      const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
      
      console.log(`📊 Tamanho: ${fileSizeInMB} MB`);
      console.log(`📅 Criado em: ${stats.birthtime.toLocaleString('pt-BR')}`);
      console.log('🎉 Documentação profissional está pronta!');
      
      return outputPath;
    }

  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error.message);
    
    // Fallback para método anterior se houver erro
    console.log('🔄 Tentando método alternativo...');
    
    try {
      const markdownpdf = require('markdown-pdf');
      const fallbackOutput = path.join(__dirname, 'DOCUMENTACAO_SISTEMA_AGROPECUARIO_FALLBACK.pdf');
      
      markdownpdf()
        .from(path.join(__dirname, 'DOCUMENTACAO_COMPLETA.md'))
        .to(fallbackOutput, function(err) {
          if (err) {
            console.error('❌ Erro no método fallback:', err);
          } else {
            console.log('✅ PDF gerado via método alternativo!');
            console.log(`📁 Localização: ${fallbackOutput}`);
          }
        });
        
    } catch (fallbackError) {
      console.error('❌ Erro no fallback:', fallbackError.message);
    }
  }
}

// Executar
generateModernPDF();
