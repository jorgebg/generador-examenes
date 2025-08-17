import { parseHeader, splitQuestions } from './parser';
import { buildDatasets, replaceForMoodle } from './eval';

function pad2(n: number): string {
  return n < 9 ? '0' + (n + 1) : String(n + 1);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function enunciadoToHtmlP(enunciado: string): string {
  if (enunciado.includes('\n')) {
    // Replace only the first newline with </p><p>
    const idx = enunciado.indexOf('\n');
    return enunciado.slice(0, idx) + '</p><p>' + enunciado.slice(idx + 1);
  }
  return enunciado;
}

export function generateMoodle(input: string): string {
  const { hasHeader, vars, body } = parseHeader(input);

  let working = hasHeader ? replaceForMoodle(body, vars) : body;

  const questions = splitQuestions(working);

  let xml = '';

  for (let qi = 0; qi < questions.length; qi++) {
    const q = questions[qi];
    const tipo = hasHeader ? 'calculatedmulti' : 'multichoice';

    let qxml = `<!-- PREGUNTA NÚMERO. COMENTARIO  -->\n  <question type="${tipo}">\n    <name>\n      <text>NOMBRE PREGUNTA</text>\n    </name>\n    <questiontext format="html">\n      <text><![CDATA[<p>ENUNCIADO</p>]]></text>\n    </questiontext>\n    <generalfeedback format="html">\n      <text></text>\n    </generalfeedback>\n    <defaultgrade>1.0000000</defaultgrade>\n    <penalty>0.3333333</penalty>\n    <hidden>0</hidden>\n    <synchronize>0</synchronize>\n    <single>1</single>\n    <answernumbering>abc</answernumbering>\n    <shuffleanswers>1</shuffleanswers>\n    <correctfeedback>\n      <text></text>\n    </correctfeedback>\n    <partiallycorrectfeedback>\n      <text></text>\n    </partiallycorrectfeedback>\n    <incorrectfeedback>\n      <text></text>\n    </incorrectfeedback>\n  `;

    const ordinal = pad2(qi);
    qxml = qxml.replace('PREGUNTA NÚMERO. COMENTARIO', 'Pregunta ' + ordinal);
    qxml = qxml.replace('NOMBRE PREGUNTA', 'Pregunta ' + ordinal);

    const stmtHtml = enunciadoToHtmlP(q.lines[0]);
    qxml = qxml.replace('ENUNCIADO', stmtHtml);

    const respuestas = q.lines.slice(1);
    const n = respuestas.length;
    const resta = Number((-100 / (n - 1)).toFixed(5));

    for (let idx = 0; idx < respuestas.length; idx++) {
      const resp = respuestas[idx];
      let axml = `<answer fraction="RESTA">\n    <text>RESPUESTA</text>\n    <tolerance>0.01</tolerance>\n    <tolerancetype>1</tolerancetype>\n    <correctanswerformat>2</correctanswerformat>\n    <correctanswerlength>3</correctanswerlength>\n    <feedback format="html">\n<text></text>\n    </feedback>\n</answer>\n`;
      axml = axml.replace('RESTA', idx === 0 ? '100' : String(resta));
      axml = axml.replace('RESPUESTA', resp);
      qxml += axml;
    }

    // units behavior
    qxml += `<unitgradingtype>0</unitgradingtype>\n    <unitpenalty>0.1000000</unitpenalty>\n    <showunits>3</showunits>\n    <unitsleft>0</unitsleft>\n`;

    if (hasHeader) {
      const datasets = buildDatasets(vars);
      qxml += `<dataset_definitions>\n`;
      for (const d of datasets) {
        const decimals = Math.max(0, 2 + Math.ceil(-Math.log10(Math.abs(d.min))))
        const longSerie = d.series.length;
        let dxml = `<dataset_definition>\n      <status><text>private</text>\n  </status>\n      <name><text>VARIABLE</text>\n  </name>\n      <type>calculatedmulti</type>\n      <distribution><text>uniform</text>\n  </distribution>\n      <minimum><text>MINIMO</text>\n  </minimum>\n      <maximum><text>MAXIMO</text>\n  </maximum>\n      <decimals><text>DECIMALES</text>\n  </decimals>\n`;
        dxml = dxml.replace('VARIABLE', d.name);
        dxml = dxml.replace('MINIMO', String(d.min));
        dxml = dxml.replace('MAXIMO', String(d.max));
        dxml = dxml.replace('DECIMALES', String(decimals));
        dxml += `<itemcount>${longSerie}</itemcount>\n          <dataset_items>\n`;
        for (let i = 0; i < d.series.length; i++) {
          const val = d.series[i];
          let item = `<dataset_item>\n            <number>NUMERO</number>\n            <value>VALOR</value>\n          </dataset_item>\n`;
          item = item.replace('NUMERO', String(i + 1));
          item = item.replace('VALOR', String(val));
          dxml += item;
        }
        dxml += `</dataset_items>\n<number_of_items>${longSerie}</number_of_items>\n</dataset_definition>\n`;
        qxml += dxml;
      }
      qxml += `</dataset_definitions>\n`;
    }

    qxml += `</question>\n`;
    xml += qxml;
  }

  xml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<quiz>\n` + xml + `</quiz>\n`;

  return xml;
}
