const express = require('express');
const sqlite = require('sqlite3');

const app = express()

/* area de configuraciones */
app.set('view engine', 'ejs');

/* middleware */
app.use(express.static('public'));
app.use(express.urlencoded({extended:false}));  

/**Conexion a base de datos */
const basededatos = new sqlite.Database('datos.db', sqlite.OPEN_READWRITE, (error) => {
    if(error) {
        console.log("error al conectarse a la base de datos")
    } else {
        console.log("se conecto a la base de datos con exito")
    }
});

/* rutas */
app.get('/', (req, res) => {
    let sql = 'select productos.id, nombre, marcas.marca, precio, stock from productos, marcas where productos.marca=marcas.id';
    basededatos.all(sql, (error, resultado) => {
        if (error) {
            console.log("error en la consulta a la base de datos");
        } else {
            sql='select * from marcas'
            basededatos.all(sql, (error, marcas) => {
                if (error) {
                    console.log('error al obtener las marcas')
                } else {
                    res.render('principal.ejs', {resultado, marcas});
                }
            }) 
        }
    })
})

/* RUTA DE NUEVO PRODUCTO */
app.post('/nuevo', (req, res) => {
    const {nombre, marca, precio, stock} = req.body;
    const sql = 'insert into productos (nombre, marca, precio, stock) values (?,?,?,?)'
    basededatos.run(sql, [nombre, marca, precio, stock], (error) => {
        if (error) {
            console.log('Error al insertar el producto')
        } else {
            res.redirect('/')
        }
    })
})

/* RUTA PARA ELIMINAR PRODUCTO */
app.get('/eliminar', (req, res) => {
    const id = req.query.id;
    const sql = 'delete from productos where id = ?'
    basededatos.run(sql, [id], (error) => {
        if (error) {
            console.log('Error al eliminar el producto');
        } else {
            res.redirect('/');
        }
    })
})

/* RUTA PARA EDITAR PRODUCTO */
app.get('/edit', (req, res) => {
    const id = req.query.id;
    let sql = 'select * from productos where id = ?'
    
    basededatos.all(sql, [id], (error, fila) => {
        if (error) {
            console.log("error en la consulta a la base de datos");
        } else {
            sql='select * from marcas'
            basededatos.all(sql, (error, marcas) => {
                if (error) {
                    console.log('error al consultar el producto')
                } else {
                    res.render('edit.ejs', {fila, marcas});
                }
            }) 
        }
        // if (error) {
        //     console.log('Error al consultar el producto');
        // } else {
        //     res.render('edit.ejs', {fila});
        // }
    })
})

/* RUTA PARA MANEJAR LO EDITADO */
app.post('/editar', (req, res) => {
    const {id, nombre, marca, precio, stock} = req.body;
    const sql = 'update productos set nombre=?, marca=?, precio=?, stock=? where id=?'
    basededatos.run(sql, [nombre, marca, precio, stock, id], (error) => {
        if(error) {
            console.log('Error al actualizar el producto');
        } else {
            res.redirect('/');
        }
    })
})

/* RUTA PARA BUSQUEDA DE PRODUCTO */
app.get('/buscar', (req, res) => {
    const nombre = req.query.nombre + '%';
    let sql = 'select productos.id, nombre, marcas.marca, precio, stock from productos, marcas where productos.marca=marcas.id and nombre like ?';
    basededatos.all(sql, [nombre], (error, resultado) => {
        if (error) {
            console.log('Error al realizar la busqueda del producto');
        } else {
            sql='select * from marcas'
            basededatos.all(sql, (error, marcas) => {
                if (error) {
                    console.log('error al obtener las marcas')
                } else {
                    res.render('principal.ejs', {resultado, marcas});
                }
            }) 
        }
    })
})

/*RUTA PARA SECCION DE MARCAS */
app.get('/marcas', (req, res) => {
    const sql = 'select * from marcas order by marca';
    basededatos.all(sql, (error, filas) => {
        if (error) {
            console.log("error al consultar la bd de marcas")
        } else {
            res.render("marcas.ejs", {filas})
        }
    })
})

/* RUTA DE NUEVA MARCA */
app.post('/nueva_marca', (req, res) => {
    const marca=req.body.marca;
    const sql = 'insert into marcas (marca) values (?)'
    basededatos.run(sql, [marca], (error) => {
        if (error) {
            console.log('Error al insertar la nueva marca')
        } else {
            res.redirect('/marcas')
        }
    })
})

/* RUTA PARA EDITAR UNA NUEVA MARCA */

app.get('/edit_marcas', (req, res) => {
    const id = req.query.id;
    const sql = 'select *from marcas where id=?';
    basededatos.all(sql, [id], (error, fila) => {
        if (error) {
            console.log('error al consultar la marca');
        } else {
            res.render('edit_marcas.ejs', {fila});
        }
    })
})

app.post('/edit_marcas', (req, res) => {
    const {id, marca} = req.body;
    const sql = 'update marcas set marca =? where id =?';
    basededatos.run(sql, [marca, id], (error) => {
        if (error) {
            console.log('error al actualizar la marca');
        } else {
            res.redirect('/marcas');
        }
    })
})

/* RUTA PARA ELIMINAR LA MARCA */

app.get('/eliminar_marca', (req, res) => {
    const id = req.query.id
    const sql = 'delete from marcas where id =?';
    basededatos.run(sql, [id], (error) => {
        if (error){
            console.log('error al eliminar la marca');
        } else {
            res.redirect('/marcas');
        }
        
    })
})

/* ejecucion del servidor */
app.listen(3000, ()=> {
    console.log('servidor escuchando por el puerto');
})

