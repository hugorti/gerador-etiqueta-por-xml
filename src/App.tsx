import React, { useState, useEffect } from 'react';
import printJS from 'print-js';
import { toast } from 'react-toastify';

const App: React.FC = () => {
  const [parsedData, setParsedData] = useState<any>(null);
  const [quantidadeImpressao, setQuantidadeImpressao] = useState<number>(0);
  const [numeroPedido, setNumeroPedido] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const xmlString = e.target?.result as string;
        parseXML(xmlString);
      };
      reader.readAsText(file);
    }
  };

  const parseXML = (xmlString: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const emitElement = xmlDoc.getElementsByTagName('dest')[0];
    const ideElement = xmlDoc.getElementsByTagName('ide')[0];
    const transportaElement = xmlDoc.getElementsByTagName('transporta')[0];
    const volElement = xmlDoc.getElementsByTagName('vol')[0];

    if (emitElement) {
      const cnpj = emitElement.getElementsByTagName('CNPJ')[0]?.textContent || '';
      const xNome = emitElement.getElementsByTagName('xNome')[0]?.textContent || '';
      const xFant = emitElement.getElementsByTagName('xFant')[0]?.textContent || '';
      const enderEmit = emitElement.getElementsByTagName('enderDest')[0];

      const volume = Number(volElement?.getElementsByTagName('qVol')[0]?.textContent || '0');
        if (volume === 0) {
          toast.error("A quantidade de volumes da nota está incorreta (valor igual a 0).");
          setTimeout(() => {
            window.location.reload();
          }, 3000); // Espera 3 segundos para recarregar a página
        }

      const caixas = volElement?.getElementsByTagName('esp')[0]?.textContent || '';

      const enderData = {
        xLgr: enderEmit?.getElementsByTagName('xLgr')[0]?.textContent || '',
        nro: enderEmit?.getElementsByTagName('nro')[0]?.textContent || '',
        xBairro: enderEmit?.getElementsByTagName('xBairro')[0]?.textContent || '',
        cMun: enderEmit?.getElementsByTagName('cMun')[0]?.textContent || '',
        xMun: enderEmit?.getElementsByTagName('xMun')[0]?.textContent || '',
        UF: enderEmit?.getElementsByTagName('UF')[0]?.textContent || '',
        CEP: enderEmit?.getElementsByTagName('CEP')[0]?.textContent || '',
        cPais: enderEmit?.getElementsByTagName('cPais')[0]?.textContent || '',
        xPais: enderEmit?.getElementsByTagName('xPais')[0]?.textContent || '',
        fone: enderEmit?.getElementsByTagName('fone')[0]?.textContent || '',
      };

      const parsedData = {
        cnpj,
        xNome,
        xFant,
        transporta: {
          xNome: transportaElement?.getElementsByTagName('xNome')[0]?.textContent || '',
        },
        vol: {
          qVol: volume,
          esp: caixas,
        },
        nNF: ideElement?.getElementsByTagName('nNF')[0]?.textContent || '',
        enderEmit: enderData,
        IE: emitElement.getElementsByTagName('IE')[0]?.textContent || '',
        CRT: emitElement.getElementsByTagName('CRT')[0]?.textContent || '',
      };

      setParsedData(parsedData);
    } else {
      console.error('Elemento <dest> não encontrado no XML');
    }
  };

  const formatCNPJ = (cnpj: string) => {
    const cleanedCNPJ = cnpj.replace(/\D/g, '');
    return cleanedCNPJ.length === 14
      ? cleanedCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
      : cnpj;
  };

  const handleImprimir = () => {
    if (!numeroPedido) {
      toast.error("Campo 'Número do Pedido' é obrigatório.");
      return; // Não prossegue com a impressão
    }
    const printContent = document.getElementById('print-content');
    if (printContent) {
      printJS({
        printable: 'print-content',
        type: 'html',
        style: `
         @media print {
            body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                }
              .div-title { width: 100%; font-size: 20px; }
              .transportadora{
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                text-decoration: underline;
              }
              .label { font-weight: bold; }
              .div-trans{
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                height: 30px;
                
              }
              .div-section { width: 65%; margin-top: 20px; background-color: black; padding: 10px; }
              .div-endereco { justify-content: space-between; }
              .footer { border: 1px solid black; background-color: black; text-decoration: underline; margin-top: 10px; padding: 5px; }
              .page { page-break-after: always; margin-left: 10px; }
              .div-label-nf{
                  justify-content: space-between;
                }
              .label-nf {font-weight: 800;}
          }
        `,
      });
    }
  };


  useEffect(() => {
    if (parsedData?.vol?.qVol) {
      setQuantidadeImpressao(parsedData.vol.qVol);
    }
  }, [parsedData]);

  return (
    <div className="container">
      <h1 className="titulo-importador">Importador de XML</h1>
      <input type="file" accept=".xml" onChange={handleFileChange} className="input-file" />
      <div className="form-group">
        {parsedData && (
          <div>
            <div className="input-container">
              <div className="div-button-imprimir">
              <label className="label">Volumes:</label>
              <input
                    type="number"
                    value={quantidadeImpressao}
                    onChange={(e) => setQuantidadeImpressao(Number(e.target.value))}
                    min={0}
                    max={parsedData.vol.qVol}
                    className="input-number"
                  />
              </div>
                <div className="div-button-imprimir">
                  <label className="label">Número do Pedido:</label>
                  <input
                    type="text"
                    required
                    value={numeroPedido}
                    onChange={(e) => setNumeroPedido(e.target.value)}
                    className="input-number"
                  />
                  </div>
                <div className="div-button-imprimir">
                  <label className="label">Qtd de volumes: <strong>{parsedData.vol.qVol}</strong></label>
                  <button onClick={handleImprimir} className="btn-imprimir">Imprimir</button>
                </div>
            </div>
            <div id="print-content" className="print-section">
              {Array.from({ length: quantidadeImpressao }, (_, index) => (
                <div className="page" key={index}>
                  <div className="div-section">
                    <h3 className="div-title"><img src="/logo.svg" alt="Logo" className="logo" /></h3>
                    <div className="div-trans">
                      <span className="transportadora">{parsedData.transporta.xNome}</span>
                      <span className="transportadora">Nº PEDIDO: {numeroPedido}</span>
                    </div>
                    <div className="div-endereco"><span className="label">RAZÃO: {parsedData.xNome}</span></div>
                    <div className="div-endereco"><span className="label">CNPJ: {formatCNPJ(parsedData.cnpj)}</span></div>
                    <div className="div-endereco">
                      <span className="label">END: {parsedData.enderEmit.xLgr}</span>
                      <span className="label">NÚMERO: {parsedData.enderEmit.nro}</span>
                    </div>
                    <div className="div-endereco">
                      <span className="label">BAIRRO: {parsedData.enderEmit.xBairro}</span>
                      <span className="label">{parsedData.enderEmit.xMun} / {parsedData.enderEmit.UF}</span>
                    </div>
                    <div className="div-label-nf">
                      <span className="label-nf">{parsedData.vol.esp} {index + 1} / {quantidadeImpressao}</span>
                      <span className="label-nf">NF: {parsedData.nNF}</span>
                    </div>
                    <div className='div-footer'><span className="footer">CARO CLIENTE, CONFIRA SUA MERCADORIA NO ATO DO RECEBIMENTO</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
