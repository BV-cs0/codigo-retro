"""Compara los resultados del motor del curso con SQLite en memoria."""
import argparse
from collections import Counter
import json
import math
import sqlite3
import sys


def identificador(nombre):
    return '"' + nombre.replace('"', '""') + '"'


def cargar(conexion, datos):
    if isinstance(datos, str):
        conexion.executescript(datos)
        return
    for nombre, tabla in datos["tablas"].items():
        definiciones = []
        for columna in tabla["columnas"]:
            restricciones = [("pk", "PRIMARY KEY"), ("notNull", "NOT NULL"), ("unique", "UNIQUE")]
            definiciones.append(" ".join([
                identificador(columna["nombre"]), columna["tipo"],
                *(sql for clave, sql in restricciones if columna.get(clave)),
            ]))
        nombre = identificador(nombre)
        conexion.execute(f"CREATE TABLE {nombre} ({', '.join(definiciones)})")
        marcas = ", ".join("?" for _ in definiciones)
        conexion.executemany(f"INSERT INTO {nombre} VALUES ({marcas})", tabla["filas"])


def parametros(caso):
    return [float(v["valor"]) if isinstance(v, dict) and v.get("tipo") == "real" else v
            for v in caso["parametros"]]


def referencia(caso):
    resultados = []
    tipos = {type(None): "null", int: "integer", float: "real", str: "text"}
    with sqlite3.connect(":memory:", autocommit=True) as conexion:
        conexion.setconfig(sqlite3.SQLITE_DBCONFIG_DQS_DML, True)
        cargar(conexion, caso["bd"])
        try:
            for parte in caso["sentencias"]:
                cursor = conexion.execute(parte["texto"], parametros(caso))
                filas = cursor.fetchall()
                resultados.append({
                    "filas": filas, "tipos": [[tipos[type(v)] for v in fila] for fila in filas],
                    "columnas": [c[0] for c in cursor.description or ()],
                    "cambios": max(0, cursor.rowcount),
                })
        except sqlite3.Error as error:
            return resultados, str(error)
    return resultados, None


def filas(resultado):
    return [tuple(zip(tipos, fila)) for tipos, fila in zip(resultado["tipos"], resultado["filas"])]


def celdas_iguales(a, b):
    return a[0] == b[0] and (a[1] == b[1] or (
        a[0] == "real" and math.isclose(a[1], b[1], rel_tol=1e-15, abs_tol=0)
    ))


def fila_igual(a, b):
    return len(a) == len(b) and all(celdas_iguales(x, y) for x, y in zip(a, b))


def resultados_iguales(a, b, orden):
    if any(a[k] != b[k] for k in ("columnas", "cambios")):
        return False
    izquierda, derecha = filas(a), filas(b)
    if len(izquierda) != len(derecha):
        return False
    if orden:
        return all(map(fila_igual, izquierda, derecha))
    faltan = list((Counter(izquierda) - Counter(derecha)).elements())
    sobran = list((Counter(derecha) - Counter(izquierda)).elements())
    for fila in faltan:
        i = next((i for i, otra in enumerate(sobran) if fila_igual(fila, otra)), None)
        if i is None:
            return False
        sobran.pop(i)
    return not sobran


def comparar(caso):
    motor = caso["motor"]
    esperado = referencia(caso)
    obtenido = motor["resultados"], motor["error"]["mensaje"] if motor["error"] else None
    a, ea = esperado
    b, eb = obtenido
    if ea == eb and len(a) == len(b) and all(
        resultados_iguales(ra, rb, parte["orden"]) for ra, rb, parte in zip(a, b, caso["sentencias"])
    ):
        return True
    print(caso["id"], caso["sql"])
    print("  SQLite:", json.dumps(esperado, ensure_ascii=False))
    print("  Motor: ", json.dumps(obtenido, ensure_ascii=False))
    return False


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("casos", help="archivo JSON o - para leer de la entrada estándar")
    args = parser.parse_args()
    if args.casos == "-":
        casos = json.load(sys.stdin)
    else:
        with open(args.casos, encoding="utf-8-sig") as archivo:
            casos = json.load(archivo)
    iguales = sum(map(comparar, casos))
    print(f"SQLite {sqlite3.sqlite_version}: {iguales} de {len(casos)} iguales")
    return int(iguales != len(casos))


if __name__ == "__main__":
    raise SystemExit(main())
