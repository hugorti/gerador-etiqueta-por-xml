import React, { useState, useEffect } from 'react';
import printJS from 'print-js';

const App: React.FC = () => {
  const [parsedData, setParsedData] = useState<any>(null);
  const [quantidadeImpressao, setQuantidadeImpressao] = useState<number>(1);

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

  const formatCNPJ = (cnpj: any) => {
    // Remove caracteres não numéricos
    const cleanedCNPJ = cnpj.replace(/\D/g, '');
  
    // Aplica a formatação
    if (cleanedCNPJ.length === 14) {
      return cleanedCNPJ.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      );
    }
  
    return cnpj; // Retorna o original se não tiver 14 dígitos
  };

  const handleImprimir = () => {
    const printContent = document.getElementById('print-content');
    if (printContent) {
      printJS({
        printable: 'print-content',
        type: 'html',
        style: `
          .div-title { width: 100%; font-size: 20px; align-items: center; }
          .transportadora {width: 100%; margin-right: 20px;}
          .label {width: 100%;  font-weight: bold; }
          .div-endereco {justify-content: space-between;}
          .footer { border: 1px solid black; background-color: black; text-decoration: underline; margin-top: 10px; padding: 5px;}
          .page { page-break-after: always;}
          @media print { .page { margin: 0; } }
        `,
      });
    }
  };

   // Define o valor inicial quando o componente é montado
   useEffect(() => {
    if (parsedData && parsedData.vol && parsedData.vol.qVol) {
      setQuantidadeImpressao(parsedData.vol.qVol); // Inicializa com o valor de parsedData.vol.qVol
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
                <div className='div-button-imprimir'>
                  <label className="label">Volumes:</label>
                  <label className="label">Qtd de volumes da Nota: <strong>{parsedData.vol.qVol}</strong></label>
                </div>
                <div className='div-button-imprimir'>
                  <input
                    type="number"
                    value={quantidadeImpressao}
                    onChange={(e) => setQuantidadeImpressao(Number(e.target.value))}
                    min="1"
                    max={parsedData.vol.qVol}
                    className="input-number"
                  />
                  <button onClick={handleImprimir} className="btn-imprimir">Imprimir</button>
                </div>
          </div>

            <div id="print-content" className="print-section">
              {Array.from({ length: quantidadeImpressao }, (_, index) => (
                <div className="page" key={index}>
                  <div className='div-title'>
                    <p className='transportadora'>{parsedData.transporta.xNome}</p>
                    <h2><img src="/logo.svg" alt="Logo" className="logo" /></h2>
                  </div>
                    <div className='div-endereco'>
                      <span className="label">RAZÃO: {parsedData.xNome}</span>
                    </div>
                    <div className='div-endereco'>
                    <span className="label">CNPJ: {formatCNPJ(parsedData.cnpj)}</span>
                    </div>
                  <div className='div-endereco'>
                    <span className="label">END: {parsedData.enderEmit.xLgr}</span>
                    <span className="label">Nº: {parsedData.enderEmit.nro}</span>
                  </div>
                  <div className='div-endereco'>
                    <span className="label">BAIRRO: {parsedData.enderEmit.xBairro}</span>
                    <span className="label">{parsedData.enderEmit.xMun} / {parsedData.enderEmit.UF}</span>
                  </div>
                  <div className='div-endereco'>
                    <span className="label">{parsedData.vol.esp} {index + 1} / {quantidadeImpressao}</span>
                    <span className="label">NF: {parsedData.nNF}</span>
                  </div>
                  <span className="footer">
                    CARO CLIENTE, CONFIRA SUA MERCADORIA NO ATO DO RECEBIMENTO
                  </span>
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
