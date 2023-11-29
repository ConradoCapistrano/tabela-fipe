const fipeAPI = "https://veiculos.fipe.org.br/api/veiculos";
const referencia = document.getElementById("referencia");
const tipoVeiculo = document.getElementById("tipo_veiculo");
const marca = document.getElementById("marca");
const modelo = document.getElementById("modelo");
const ano = document.getElementById("ano");
const consultar = document.getElementById("search");
const resultado = document.getElementById("resultado");
let chart = null;

//FUNCOES
const generateLabelMonth = (string)=> {
  return string.charAt(0).toUpperCase() + string.slice(1).substring(0, 2);
}

const generateLabelYear = (string)=> {
  return string.slice(2);
}

const generateReferenciaHistorico = (data)=> {
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  let years_months = new Map();

  data.forEach((item) => {
    const [mes, ano] = item.Mes.replace(/\s/g, "").split("/");
    const data = {
      label: `${generateLabelMonth(mes)}/${generateLabelYear(ano)}`,
      id: item.Codigo,
    };

    years_months.set(
      ano,
      years_months.get(ano) ? [...years_months.get(ano), data] : [data]
    );
  });

  return Array.from(years_months).map(([key, value]) => {
    value.sort((a, b) => months[a[0]] - months[b[0]]);
    return { year: key, data: value };
  });
}

//FUNCOES PARA CARREGAR AS OPCOES DA TABELA
async function loadReferencia() {
  try {
    const { data } = await axios.post(`${fipeAPI}/ConsultarTabelaDeReferencia`);

    referenciaHistorico = generateReferenciaHistorico(data);

    data.forEach((element) => {
      const option = document.createElement("option");
      option.text = element.Mes;
      option.value = element.Codigo;

      referencia.add(option);
    });

    referencia.removeAttribute("disabled");
  } catch (err) {
    console.log("loadReferencia error", err);
  }
}

async function loadMarcas() {
  try {
    const form = new FormData();
    form.append("codigoTabelaReferencia", parseInt(referencia.value, 10));
    form.append("codigoTipoVeiculo", parseInt(tipoVeiculo.value, 10));

    const { data } = await axios.post(`${fipeAPI}/ConsultarMarcas`, form);

    data.forEach((element) => {
      const option = document.createElement("option");
      option.text = element.Label;
      option.value = element.Value;

      marca.add(option);
    });

    marca.removeAttribute("disabled");
  } catch (err) {
    console.log("loadMarcas error", err);
  }
}

async function loadModelos() {
  try {
    const form = new FormData();
    form.append("codigoTabelaReferencia", parseInt(referencia.value, 10));
    form.append("codigoTipoVeiculo", parseInt(tipoVeiculo.value, 10));
    form.append("codigoMarca", parseInt(marca.value, 10));

    const {
      data: { Modelos: data },
    } = await axios.post(`${fipeAPI}/ConsultarModelos`, form);

    data.forEach((element) => {
      const option = document.createElement("option");
      option.text = element.Label;
      option.value = element.Value;

      modelo.add(option);
    });

    modelo.removeAttribute("disabled");
  } catch (err) {
    console.log("loadModelos error", err);
  }
}

async function loadAnos() {
  try {
    const form = new FormData();
    form.append("codigoTabelaReferencia", parseInt(referencia.value, 10));
    form.append("codigoTipoVeiculo", parseInt(tipoVeiculo.value, 10));
    form.append("codigoMarca", parseInt(marca.value, 10));
    form.append("codigoModelo", parseInt(modelo.value, 10));

    const { data } = await axios.post(`${fipeAPI}/ConsultarAnoModelo`, form);

    data.forEach((element) => {
      const option = document.createElement("option");
      option.text =
        element.Value.indexOf("32000") !== -1 ? "Zero KM" : element.Label;
      option.value = element.Value;

      ano.add(option);
    });

    ano.removeAttribute("disabled");
  } catch (err) {
    console.log("loadAnos error", err);
  }
}

async function loadVeiculo() {
  try {
    const [anoModelo, codigoTipoCombustivel] = ano.value.split("-");

    const form = new FormData();
    form.append("codigoTabelaReferencia", parseInt(referencia.value, 10));
    form.append("codigoTipoVeiculo", parseInt(tipoVeiculo.value, 10));
    form.append("codigoMarca", parseInt(marca.value, 10));
    form.append("codigoModelo", parseInt(modelo.value, 10));
    form.append("ano", ano.value);
    form.append("anoModelo", parseInt(anoModelo, 10));
    form.append("codigoTipoCombustivel", parseInt(codigoTipoCombustivel, 10));
    form.append("tipoConsulta", "tradicional");

    consultar.setAttribute("disabled", true);

    const { data } = await axios.post(
      `${fipeAPI}/ConsultarValorComTodosParametros`,
      form
    );

    renderVeiculo(data);

    consultar.removeAttribute("disabled");
  } catch (err) {
    console.log("loadVeiculo error", err);
  }
}

function renderVeiculo(data) {
  const {
    MesReferencia,
    CodigoFipe,
    Marca,
    Modelo,
    Valor,
  } = data;

  const AnoModelo = data.AnoModelo === 32000 ? "Zero KM" : data.AnoModelo;

  const result = `
    <table>
      <tbody>
        <tr>
          <td class="td_1">Marca:</td>
          <td>${Marca}</td>
        </tr>
        <tr>
          <td class="td_1">Modelo:</td>
          <td>${Modelo}</td>
        </tr>
        <tr>
          <td class="td_1">Ano do modelo:</td>
          <td>${AnoModelo}</td>
        </tr>
        <tr>
          <td class="td_1">Código FIPE:</td>
          <td>${CodigoFipe}</td>
        </tr>
        <tr>
          <td class="td_1">Mês referência:</td>
          <td>${MesReferencia}</td>
        </tr>
        <tr>
          <td class="td_1">Valor pela FIPE:</td>
          <td>${Valor}</td>
        </tr>
      </tbody>
    </table>
  `;

  resultado.innerHTML = result;
  resultado.scrollIntoView({ behavior: "smooth" });
}

//ADD EVENT LISTENER
referencia.addEventListener("change", (event) => {
  if (event.target.value !== "") {
    tipoVeiculo.removeAttribute("disabled");
  } else {
    tipoVeiculo.setAttribute("disabled", true);
  }

  tipoVeiculo.value = "";

  marca.setAttribute("disabled", true);
  marca.innerHTML = `<option value="">-</option>`;

  modelo.setAttribute("disabled", true);
  modelo.innerHTML = `<option value="">-</option>`;

  ano.setAttribute("disabled", true);
  ano.innerHTML = `<option value="">-</option>`;

  consultar.setAttribute("disabled", true);

  resultado.innerHTML = "";
});

tipoVeiculo.addEventListener("change", (event) => {
  if (event.target.value !== "") {
    loadMarcas();
  }
  marca.setAttribute("disabled", true);
  marca.innerHTML = `<option value="">-</option>`;

  modelo.setAttribute("disabled", true);
  modelo.innerHTML = `<option value="">-</option>`;

  ano.setAttribute("disabled", true);
  ano.innerHTML = `<option value="">-</option>`;

  consultar.setAttribute("disabled", true);

  resultado.innerHTML = "";
});

marca.addEventListener("change", (event) => {
  if (event.target.value !== "") {
    loadModelos();
  }

  modelo.setAttribute("disabled", true);
  modelo.innerHTML = `<option value="">-</option>`;

  ano.setAttribute("disabled", true);
  ano.innerHTML = `<option value="">-</option>`;

  consultar.setAttribute("disabled", true);

  resultado.innerHTML = "";
});

modelo.addEventListener("change", (event) => {
  if (event.target.value !== "") {
    loadAnos();
  }

  ano.setAttribute("disabled", true);
  ano.innerHTML = `<option value="">-</option>`;

  consultar.setAttribute("disabled", true);

  resultado.innerHTML = "";
});

ano.addEventListener("change", (event) => {
  if (event.target.value !== "") {
    consultar.removeAttribute("disabled");
  } else {
    consultar.setAttribute("disabled", true);
  }

  resultado.innerHTML = "";
});

consultar.addEventListener("click", () => {
  loadVeiculo();
});

document.addEventListener("DOMContentLoaded", () => {
  loadReferencia();
});