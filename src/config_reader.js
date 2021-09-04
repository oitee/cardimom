import { readFileSync } from 'fs';

export function reader(path){
try {
  const data = readFileSync(path, 'utf8');
  return data;
} catch (err) {
  console.error(err)
}
}
//let path = 'blog_spec.json';
//console.log(reader(path));