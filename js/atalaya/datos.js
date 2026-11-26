/*
Formato: registrar(categoria, { es: [reto], en: [reto] }). Las listas pueden
estar vacías. Conserva id, categoria, puntos y estructura entre idiomas.

Ejemplo:
  { id: 'A1', categoria: 'A', puntos: 100, titulo: 'Nota', nix: 'Busca la nota.',
    fs: { '.nota': { contenido: 'FLAG{nota}\n', dueno: 'analista',
      permisos: 'rw-r-----', suid: false } },
    sitios: {}, sudo: {}, pistas: ['Mira en casa.', 'Prueba ls -a.'],
    bandera: 'FLAG{nota}', solucion: ['ls -a', 'cat .nota', 'enviar FLAG{nota}'],
    cierre: { hecho: 'Leíste la nota.', defensa: 'Revisa los permisos.',
      comandos: ['ls', 'cat'] } }

fs: rutas absolutas o relativas a HOME. Una cadena abrevia { contenido }.
null o una ruta con / final indica directorio. dueno, grupo, permisos (nueve
caracteres rwx) y suid (booleano) son opcionales.
sitios: origen HTTP → ruta → { codigo, cabeceras, cuerpo, cookie?, parametros? }
o una lista de variantes con esa forma. cookie y parametros son mapas
nombre → valor. Gana la primera coincidencia. Las variantes sin filtros van al final.
sudo: ruta absoluta → salida simulada autorizada (texto), o { script: true } para
ejecutar ese archivo de verdad como root (root lee y escribe todo en el sistema simulado).
requisito (opcional): { cumplido(sesion) → booleano, falta: texto }. La bandera solo
cuenta si además se cumple (por ejemplo, haber quitado un permiso con chmod).
solucion incluye la entrega. cierre.comandos contiene nombres de órdenes.
*/
(function (CR) {
'use strict';
const categorias = ['A', 'B', 'C', 'D', 'E'];
const porIdioma = { es: {}, en: {} };
function registrar(categoria, idiomas) {
  for (const idioma of ['es', 'en']) porIdioma[idioma][categoria] = idiomas[idioma];
}
function lista(idioma) {
  return categorias.flatMap(c => porIdioma[idioma][c] ?? []);
}
function sesion(reto, idioma) {
  const usuario = idioma === 'en' ? 'analyst' : 'analista';
  const maquina = idioma === 'en' ? 'watchtower' : 'atalaya';
  const cuenta = { usuario, maquina, home: '/home/' + usuario };
  return CR.Shell.Bash.sesionTerminal({ idioma, cuenta, reto,
    fs: { '/etc/hosts': '10.9.0.10 ' + maquina + '\n', ...reto.fs } });
}
function reto(id, puntos, idioma, textos, fs, bandera, ordenes, comandos) {
  const [titulo, nix, pistas, hecho, defensa] = textos;
  return { id, categoria: id[0], puntos, titulo, nix, fs, sitios: {}, sudo: {}, pistas,
    bandera, solucion: [...ordenes, (idioma === 'es' ? 'enviar ' : 'submit ') + bandera],
    cierre: { hecho, defensa, comandos } };
}
CR.Atalaya = { categorias, registrar, lista, sesion, reto };
})(globalThis.CR);
