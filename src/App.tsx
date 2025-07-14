import React, { useState, useEffect } from "react";
import printJS from "print-js";
import { toast } from "react-toastify";

const App: React.FC = () => {
  const [expandido, setExpandido] = useState(false);

  const [parsedData, setParsedData] = useState<any>(null);
  const [quantidadeImpressao, setQuantidadeImpressao] = useState<number>(0);
  const [numeroPedido, setNumeroPedido] = useState<string>("");
  const [numeroOc, setNumeroOc] = useState<string>("");
  const [cnpjManual, setCnpjManual] = useState<string>("");
  const [usarCnpjManual, setUsarCnpjManual] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setExpandido(true);
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
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const emitElement = xmlDoc.getElementsByTagName("dest")[0];
    const ideElement = xmlDoc.getElementsByTagName("ide")[0];
    const transportaElement = xmlDoc.getElementsByTagName("transporta")[0];
    const volElement = xmlDoc.getElementsByTagName("vol")[0];

    if (emitElement) {
      const cnpj =
        emitElement.getElementsByTagName("CNPJ")[0]?.textContent || "";
      const xNome =
        emitElement.getElementsByTagName("xNome")[0]?.textContent || "";
      const xFant =
        emitElement.getElementsByTagName("xFant")[0]?.textContent || "";
      const enderEmit = emitElement.getElementsByTagName("enderDest")[0];

      const volume = Number(
        volElement?.getElementsByTagName("qVol")[0]?.textContent || "0"
      );
      if (volume === 0) {
        toast.error(
          "A quantidade de volumes da nota está incorreta (valor igual a 0)."
        );
        setTimeout(() => {
          window.location.reload();
        }, 3000); // Espera 3 segundos para recarregar a página
      }

      const caixas =
        volElement?.getElementsByTagName("esp")[0]?.textContent || "";

      let natOp =
        ideElement?.getElementsByTagName("natOp")[0]?.textContent || "";

      // Condicional para ajustar o valor de natOp
      if (natOp.includes("VEND")) {
        natOp = "VENDA";
      } else if (natOp.includes("VDA")) {
        natOp = "VENDA";
      } else if (natOp.includes("AMOST")) {
        natOp = "AMOSTRA";
      } else if (natOp.includes("BONIF")) {
        natOp = "BONIFICAÇÃO";
      }

      let transporta =
        transportaElement?.getElementsByTagName("xNome")[0]?.textContent || "";

      // Condicional para ajustar o valor de transporta
      if (transporta.includes("BERTOL")) {
        transporta = "BERTOLINI";
      } else if (transporta.includes("RODON")) {
        transporta = "RODONOVA";
      } else if (transporta.includes("GUANAB")) {
        transporta = "GUANABARA";
      } else if (transporta.includes("TRANSRAP")) {
        transporta = "TRANSRAPIDO";
      } else if (transporta.includes("LEITE EXPRESS")) {
        transporta = "LEITE EXPRESS";
      }

      const enderData = {
        xLgr: enderEmit?.getElementsByTagName("xLgr")[0]?.textContent || "",
        nro: enderEmit?.getElementsByTagName("nro")[0]?.textContent || "",
        xBairro:
          enderEmit?.getElementsByTagName("xBairro")[0]?.textContent || "",
        cMun: enderEmit?.getElementsByTagName("cMun")[0]?.textContent || "",
        xMun: enderEmit?.getElementsByTagName("xMun")[0]?.textContent || "",
        UF: enderEmit?.getElementsByTagName("UF")[0]?.textContent || "",
        CEP: enderEmit?.getElementsByTagName("CEP")[0]?.textContent || "",
        cPais: enderEmit?.getElementsByTagName("cPais")[0]?.textContent || "",
        xPais: enderEmit?.getElementsByTagName("xPais")[0]?.textContent || "",
        fone: enderEmit?.getElementsByTagName("fone")[0]?.textContent || "",
      };

      const parsedData = {
        cnpj,
        xNome,
        xFant,
        transporta: {
          xNome: transporta,
        },
        vol: {
          qVol: volume,
          esp: caixas,
        },
        nNF: ideElement?.getElementsByTagName("nNF")[0]?.textContent || "",
        natOp,
        enderEmit: enderData,
        IE: emitElement.getElementsByTagName("IE")[0]?.textContent || "",
        CRT: emitElement.getElementsByTagName("CRT")[0]?.textContent || "",
      };

      setParsedData(parsedData);
      setCnpjManual(cnpj); // Define o CNPJ do XML como valor inicial
    } else {
      console.error("Elemento <dest> não encontrado no XML");
    }
  };

  const formatCNPJ = (cnpj: string) => {
    const cleanedCNPJ = cnpj.replace(/\D/g, "");
    return cleanedCNPJ.length === 14
      ? cleanedCNPJ.replace(
          /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
          "$1.$2.$3/$4-$5"
        )
      : cnpj;
  };

  const handleImprimir = () => {
    if (!numeroPedido) {
      toast.error("Campo 'Número do Pedido' é obrigatório.");
      return;
    }
    if (!numeroOc) {
      toast.error("Campo 'Número da OC' é obrigatório.");
      return;
    }
    const printContent = document.getElementById("print-content");
    if (printContent) {
      printJS({
        printable: "print-content",
        type: "html",
        style: `
         @media print {
            body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                }
              .div-title {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                }
              .transportadora{
                display: flex;
                width: 70%;
                flex-direction: column;
                align-items: left;
                justify-content: center;
                font-weight: 800;
                text-decoration: underline;
              }
                .n-pedido{
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-weight: bold;
              }
              .label { font-weight: bold; }
              .div-trans{
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 30px;
              }
              .div-oc{
                display: flex;
                align-items: center;
                text-align: center;
                justify-content: right;
         
                height: 30px;
              }
              .n-oc{
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-weight: 800;
              }
              .div-section { width: 65%; margin-top: 20px; padding: 10px; }
              .div-endereco { justify-content: space-between; }
              .footer { background-color: black;color: white; }
              
              .page { page-break-after: always; margin-left: 10px; }
              .footer-importador{
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
              .div-label-nf{
                  justify-content: space-between;
                }
              .label-nf {font-weight: 600;}
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
    <div className={`container ${expandido ? "altura-expandida" : ""}`}>
      <div className="titulos-arquivo">
        <span className="titulo-importador">Importador de XML</span>
        <span className="footer-importador">Desenvolvido por: TI LABOTRAT</span>
        <input
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          className="input-file"
        />
      </div>
      <div className="form-group">
        {parsedData && (
          <div className="form-group-layout">
            <div className="input-container">
              <div className="div-button-imprimir">
                <label className="label">Volumes:</label>
                <input
                  type="number"
                  value={quantidadeImpressao}
                  onChange={(e) =>
                    setQuantidadeImpressao(Number(e.target.value))
                  }
                  min={0}
                  max={parsedData.vol.qVol}
                  className="input-number"
                />
              </div>
              <div className="div-button-imprimir">
                <label className="label">Nº Pedido:</label>
                <input
                  type="text"
                  required
                  value={numeroPedido}
                  onChange={(e) => setNumeroPedido(e.target.value)}
                  className="input-number"
                />
              </div>
              <div className="div-button-imprimir">
                <label className="label">Nº OC:</label>
                <input
                  type="text"
                  required
                  value={numeroOc}
                  onChange={(e) => setNumeroOc(e.target.value)}
                  className="input-number"
                />
              </div>
              <div className="div-button-imprimir">
                <label className="label">Usar CNPJ diferente:</label>
                <label
                  className={`botao-checkbox ${
                    usarCnpjManual ? "ativo" : "inativo"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={usarCnpjManual}
                    onChange={(e) => setUsarCnpjManual(e.target.checked)}
                    className="checkbox-escondido"
                  />
                  {usarCnpjManual ? "Desativar" : "Ativar"}
                </label>
              </div>

              {usarCnpjManual && (
                <div className="div-button-imprimir">
                  <label className="label">CNPJ Manual:</label>
                  <input
                    type="text"
                    value={cnpjManual}
                    onChange={(e) => setCnpjManual(e.target.value)}
                    className="input-number"
                    placeholder="Digite o CNPJ"
                  />
                </div>
              )}
              <div className="div-button-imprimir">
                <label className="label">
                  Qtd de volumes: <strong>{parsedData.vol.qVol}</strong>
                </label>
                <button onClick={handleImprimir} className="btn-imprimir">
                  Imprimir
                </button>
              </div>
            </div>
            <div id="print-content" className="print-section">
              {Array.from({ length: quantidadeImpressao }, (_, index) => (
                <div className="page" key={index}>
                  <div className="div-section">
                    <div className="div-title">
                      <h3 className="">
                        <img src="/logo.svg" alt="Logo" className="logo" />
                      </h3>
                      <span className="label-nf">{parsedData.natOp}</span>
                    </div>
                    <div className="div-oc">
                      <span className="n-oc">OC: {numeroOc}</span>
                    </div>
                    <div className="div-trans">
                      <span className="transportadora">
                        {parsedData.transporta.xNome}
                      </span>
                      <span className="n-pedido">
                        Nº PEDIDO: {numeroPedido}
                      </span>
                    </div>
                    <div className="div-endereco">
                      <span className="label">RAZÃO: {parsedData.xNome}</span>
                    </div>
                    <div className="div-endereco">
                      <span className="label">
                        CNPJ:{" "}
                        {formatCNPJ(
                          usarCnpjManual ? cnpjManual : parsedData.cnpj
                        )}
                      </span>
                    </div>
                    <div className="div-label-nf">
                      <span className="label-nf">
                        {parsedData.vol.esp} {index + 1} / {quantidadeImpressao}
                      </span>
                      <span className="label-nf">NF: {parsedData.nNF}</span>
                    </div>
                    <div className="div-footer">
                      <span className="footer">
                        CONFIRA A MERCADORIA NO ATO DO RECEBIMENTO
                      </span>
                      <span className="footer-importador">
                        Desenvolvido por: TI LABOTRAT
                      </span>
                    </div>
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
