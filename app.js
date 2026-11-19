const monedaCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

function actualizarSimulacion() {
  const l = Math.max(parseFloat(document.getElementById('lado').value) || 0, 0);
  const h = Math.max(parseFloat(document.getElementById('altura').value) || 0, 0);
  const ap = Math.max(parseFloat(document.getElementById('apotema').value) || 0, 0);

  // Área total superficial: AT = l^2 + 4lh + 2la_p
  const areaBase = l * l;
  const areaCubo = 4 * l * h;
  const areaPiramide = 2 * l * ap;
  const areaTotal = areaBase + areaCubo + areaPiramide;

  document.getElementById('pasosArea').innerHTML = `
    <li><strong>Base inferior (l²):</strong> ${l}² = <strong>${areaBase.toFixed(2)} cm²</strong></li>
    <li><strong>Caras cubo (4·l·h):</strong> 4 × (${l} × ${h}) = <strong>${areaCubo.toFixed(2)} cm²</strong></li>
    <li><strong>Caras pirámide (2·l·a<sub>p</sub>):</strong> 2 × (${l} × ${ap}) = <strong>${areaPiramide.toFixed(2)} cm²</strong></li>
  `;

  document.getElementById('totalArea').innerHTML =
    `Área Total Superficial (A<sub>T</sub>) = ${areaTotal.toFixed(2)} cm²`;

  // Función lineal de costos: C(x) = Cf + Cv * x
  const cf = Math.max(parseFloat(document.getElementById('cf').value) || 0, 0);
  const cv = Math.max(parseFloat(document.getElementById('cv').value) || 0, 0);
  const x = Math.max(parseInt(document.getElementById('cantidad').value) || 1, 1);

  const costoVariableTotal = cv * x;
  const costoTotal = cf + costoVariableTotal;
  const costoUnitarioPromedio = costoTotal / x;

  // Propuesta de mejora: reducción del 22% en el costo variable unitario
  const factorReduccion = 0.22;
  const cvOptimizado = cv * (1 - factorReduccion);
  const costoOptimizado = cf + cvOptimizado * x;
  const costoUnitarioOptimizado = costoOptimizado / x;

  const ahorroTotal = costoTotal - costoOptimizado;
  const ahorroPorUnidad = costoUnitarioPromedio - costoUnitarioOptimizado;

  document.getElementById('pasosCostos').innerHTML = `
    <li><strong>Función C(${x}):</strong> ${monedaCOP.format(cf)} + (${monedaCOP.format(cv)} × ${x})</li>
    <li><strong>Costo variable del lote:</strong> ${monedaCOP.format(costoVariableTotal)}</li>
    <li><strong>Con mejora (-22% en C<sub>v</sub>):</strong> C<sub>v</sub> nuevo = <strong>${monedaCOP.format(cvOptimizado)}</strong> · Total lote = <strong>${monedaCOP.format(costoOptimizado)}</strong></li>
  `;

  document.getElementById('totalCostos').textContent =
    `Costo Total Actual C(${x}) = ${monedaCOP.format(costoTotal)}`;

  // Indicadores destacados de costo unitario promedio y ahorro
  document.getElementById('kpiUnitarioPromedio').textContent =
    monedaCOP.format(costoUnitarioPromedio);
  document.getElementById('kpiUnitarioMejorado').textContent =
    monedaCOP.format(costoUnitarioOptimizado);
  document.getElementById('kpiAhorroTotal').textContent =
    monedaCOP.format(ahorroTotal);
  document.getElementById('kpiAhorroUnidad').textContent =
    monedaCOP.format(ahorroPorUnidad);

  document.getElementById('detalleCostos').innerHTML =
    `El costo unitario promedio pasa de <strong>${monedaCOP.format(costoUnitarioPromedio)}</strong> a ` +
    `<strong>${monedaCOP.format(costoUnitarioOptimizado)}</strong> por trofeo: ahorras ` +
    `<strong>${monedaCOP.format(ahorroPorUnidad)}</strong> por unidad y ` +
    `<strong>${monedaCOP.format(ahorroTotal)}</strong> en un lote de <strong>${x}</strong> unidades.`;

  renderizarGrafica(cf, cv, cvOptimizado, x);
}

function aplicarEscenario(escenario) {
  if (escenario === 'base') {
    document.getElementById('lado').value = 10;
    document.getElementById('altura').value = 8;
    document.getElementById('apotema').value = 14;
    document.getElementById('cf').value = 150000;
    document.getElementById('cv').value = 28000;
    document.getElementById('cantidad').value = 50;
  } else if (escenario === 'loteAlto') {
    document.getElementById('lado').value = 10;
    document.getElementById('altura').value = 8;
    document.getElementById('apotema').value = 14;
    document.getElementById('cf').value = 150000;
    document.getElementById('cv').value = 28000;
    document.getElementById('cantidad').value = 150;
  } else if (escenario === 'mayorTamano') {
    document.getElementById('lado').value = 12;
    document.getElementById('altura').value = 10;
    document.getElementById('apotema').value = 16;
    document.getElementById('cf').value = 180000;
    document.getElementById('cv').value = 32000;
    document.getElementById('cantidad').value = 50;
  }
  actualizarSimulacion();
}

function renderizarGrafica(cf, cv, cvOpt, cantidadActual) {
  const canvas = document.getElementById('canvasCostos');
  const ctx = canvas.getContext('2d');
  const ancho = canvas.width;
  const alto = canvas.height;

  ctx.clearRect(0, 0, ancho, alto);

  const izq = 52;
  const abajo = 38;
  const arriba = 22;
  const der = 24;

  const maxX = Math.max(cantidadActual, 10);
  const maxY = Math.max(cf + cv * maxX, 1);

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(izq, arriba);
  ctx.lineTo(izq, alto - abajo);
  ctx.lineTo(ancho - der, alto - abajo);
  ctx.stroke();

  const escX = (val) => izq + (val / maxX) * (ancho - izq - der);
  const escY = (val) => (alto - abajo) - (val / maxY) * (alto - arriba - abajo);

  // Línea de costo actual
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(escX(0), escY(cf));
  ctx.lineTo(escX(maxX), escY(cf + cv * maxX));
  ctx.stroke();

  // Línea de costo con mejora
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(escX(0), escY(cf));
  ctx.lineTo(escX(maxX), escY(cf + cvOpt * maxX));
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '12px Segoe UI';
  ctx.fillText('Cantidad (x)', ancho - 95, alto - 10);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(izq + 14, arriba + 8, 12, 12);
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('Costo Actual C(x)', izq + 32, arriba + 18);

  ctx.fillStyle = '#10b981';
  ctx.fillRect(izq + 14, arriba + 28, 12, 12);
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('Con Mejora (-22% Cᵥ)', izq + 32, arriba + 38);
}

document.querySelectorAll('input').forEach((campo) => {
  campo.addEventListener('input', actualizarSimulacion);
});

actualizarSimulacion();