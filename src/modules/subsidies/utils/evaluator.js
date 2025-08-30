import get from 'lodash.get';
export function evaluateRules(metrics, rules){
  const details = rules.map(r=>{
    const actual = get(metrics, r.fieldPath.replace(/^metrics\./,''));
    let pass=false;
    switch(r.operator){
      case '>=': pass = actual >= r.value; break;
      case '>': pass = actual > r.value; break;
      case '==': pass = actual == r.value; break;
      case '<=': pass = actual <= r.value; break;
      case '<': pass = actual < r.value; break;
    }
    return { rule:r, actual, pass };
  });
  const allPass = details.every(d=>d.pass);
  const score = details.reduce((s,d)=> s + (d.pass ? (d.rule.weight||1) : 0), 0);
  return { allPass, score, details };
}
