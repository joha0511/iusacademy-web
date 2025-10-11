const fs = require('fs');
const path = require('path');

class IusExplainerReporter {
  onRunComplete(_, results) {
    try {
      const outDir = path.resolve(process.cwd(), 'reports');
      fs.mkdirSync(outDir, { recursive: true });
      const outFile = path.join(outDir, 'iusacademy-tests-report.html');

      // Totales globales
      const total = results.numTotalTests;
      const passed = results.numPassedTests;
      const failed = results.numFailedTests;
      const skipped = results.numPendingTests + results.numTodoTests;
      const suites = results.numTotalTestSuites;
      const suitesPassed = results.numPassedTestSuites;
      const suitesFailed = results.numFailedTestSuites;

      
      const nowLocal = new Intl.DateTimeFormat('es-BO', {
        timeZone: 'America/La_Paz',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      }).format(new Date());

      const esc = (s) =>
        String(s).replace(/[&<>"']/g, (c) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }[c]));

      // Construir secciones por archivo
      const fileSections = (results.testResults || []).map((tr) => {
        const filePath = tr.testFilePath || tr.name || '';
        const rel = path.relative(process.cwd(), filePath);
        const runtime = tr.perfStats && typeof tr.perfStats.runtime === 'number'
          ? `${tr.perfStats.runtime} ms`
          : '—';

        // Conteo por archivo
        const filePassed = tr.numPassingTests ?? (tr.testResults || []).filter(t => t.status === 'passed').length;
        const fileFailed = tr.numFailingTests ?? (tr.testResults || []).filter(t => t.status === 'failed').length;
        const fileSkipped = (tr.testResults || []).filter(t => t.status === 'pending' || t.status === 'todo').length;

        const rows = (tr.testResults || []).map((t) => {
          const status = t.status; // 'passed' | 'failed' | 'pending' | 'todo'
          const dur = (typeof t.duration === 'number') ? `${t.duration} ms` : '—';
          const block = (t.ancestorTitles || []).join(' › ');
          return `
            <tr>
              <td>${esc(block)}</td>
              <td>${esc(t.title)}</td>
              <td><span class="badge ${status === 'passed' ? 'ok' : status === 'failed' ? 'err' : 'warn'}">${status}</span></td>
              <td>${dur}</td>
            </tr>
          `;
        }).join('\n');

        return `
          <section class="panel">
            <h3>${esc(rel)}</h3>
            <div class="kv">
              <span class="badge ok">✔ Aprobadas: ${filePassed}</span>
              <span class="badge ${fileFailed ? 'err' : ''}">✖ Fallidas: ${fileFailed}</span>
              <span class="badge warn">… Omitidas: ${fileSkipped}</span>
              <span class="badge time">⏱ Duración archivo: ${runtime}</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Bloque</th>
                  <th>Prueba</th>
                  <th>Estado</th>
                  <th>Duración</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </section>
        `;
      }).join('\n');

      // HTML final
      const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>IusAcademy — Reporte explicativo de pruebas</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  :root { --bg:#0b1020; --panel:#121833; --ink:#eaf0ff; --muted:#a9b4d0; --ok:#27c17a; --warn:#f2a70b; --err:#ff6b6b; --chip:#1b2350; --code:#0a0f23; }
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,Segoe UI,Roboto,Ubuntu,Arial}
  .wrap{max-width:980px;margin:30px auto;padding:0 18px 60px}
  header{display:flex;align-items:center;gap:14px;margin-bottom:10px}
  .logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#4b6bff,#884bff);display:grid;place-items:center;font-weight:700}
  h1{margin:0;font-size:clamp(20px,3vw,32px)} .sub{color:var(--muted);font-size:13px}
  .panel{background:var(--panel);border:1px solid #1c2450;border-radius:14px;padding:16px;margin:16px 0}
  h2{margin:0 0 6px 0;font-size:18px} h3{margin:0 0 10px 0;font-size:16px}
  .kv{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
  .chip{background:var(--chip);padding:6px 10px;border-radius:999px;border:1px solid #25306c;font-size:12px}
  .ok{color:var(--ok)} .err{color:var(--err)} .warn{color:var(--warn)}
  table{width:100%;border-collapse:collapse;margin-top:8px} th,td{padding:8px;border-bottom:1px solid #1b2348;text-align:left}
  .badge{display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:999px;border:1px solid #25306c;background:#16204a;font-size:12px}
  .badge.ok{border-color:#1f5742;background:#0f2a22}
  .badge.warn{border-color:#6b571f;background:#2a230f}
  .badge.err{border-color:#6b1f1f;background:#2a0f0f}
  .badge.time{border-color:#4a3a18;background:#2a230f}
  pre{background:var(--code);padding:12px;border-radius:12px;border:1px solid #1b2348;overflow:auto}
  .foot{color:var(--muted);font-size:12px;margin-top:12px}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="logo">IA</div>
    <div>
      <h1>Reporte de pruebas unitarias — IusAcademy</h1>
      <div class="sub">Generado ${esc(nowLocal)}</div>
    </div>
  </header>

  <section class="panel">
    <h2>Resumen</h2>
    <div class="kv">
      <span class="chip">Suites: ${suitesPassed}/${suites} OK</span>
      <span class="chip">Tests: ${passed}/${total} OK</span>
      <span class="chip ${failed ? 'err':''}">Fallidos: ${failed}</span>
      <span class="chip">Omitidos: ${skipped}</span>
    </div>
    <p class="sub">Este reporte se genera automáticamente al finalizar <strong>Jest</strong> (con <strong>Supertest</strong>). Resume qué pruebas se ejecutaron, sus estados y cuánto tardó cada una.</p>
  </section>

  <section class="panel">
    <h2>¿Qué valida esta suite?</h2>
    <ul>
      <li><strong>Crear:</strong> registro de usuario válido sin exponer contraseñas.</li>
      <li><strong>Editar:</strong> actualización de usuario existente (por ejemplo, nombre).</li>
      <li><strong>Eliminar:</strong> borrado de usuario y posterior 404 al intentar editarlo.</li>
    </ul>
  </section>

  ${fileSections}

  <section class="panel">
    <h2>Cómo reproducir</h2>
    <pre>1) Configura .env.test con DATABASE_URL a iusacademy_test
2) Aplica migraciones de prueba (pretest ya lo hace):  npx prisma migrate deploy
3) Corre las pruebas:  npm test
4) Abre el reporte:  reports/iusacademy-tests-report.html</pre>
  </section>

  <div class="foot">IUSAcademy • Backend QA • Reporter HTML generado por Jest</div>
</div>
</body>
</html>`;

      fs.writeFileSync(outFile, html, 'utf-8');
      // Ruta útil en consola
      // eslint-disable-next-line no-console
      console.log(`\n📄 Reporte HTML generado: ${outFile}\n`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('No se pudo generar el reporte HTML:', e);
    }
  }
}

module.exports = IusExplainerReporter;
