var veiculo = {
    type1: "carros",
    type2: "motos",
    type3: "caminhoes" 
}

fetch(`https://parallelum.com.br/fipe/api/v1/${veiculo.type1}/marcas`).then(resposta=>{
    return resposta.json();
}).then(corpo=>{
    console.log(corpo.json());
});