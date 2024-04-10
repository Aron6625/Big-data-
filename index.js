const RestApi = require('./utils/request');
const express = require('express');
const boundings = require('./utils/boundings');
const tipoVenta = require('./utils/filter');
const getRandomDate = require('./utils/date_radom');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

app.use(express.static('public'));

router.get('/', (req, res) => {
  const users = [
    { id: 1, name: 'John' },
  ];

  res.json(users);
});

router.post('/', async (req, res) => {
  const body = req.body;

  try {
    const headers = ['Direccion', 'Precio', 'Tipo_Adquicision', 'Habitaciones', 'Banios', 'Ciudad', 'Fecha']
    fs.writeFileSync('./public/results.csv', 'sep=;\n' + headers.join(';'));
    
    const operaciones = body.operacion.split(',');

    for(const operacion of operaciones) {
      const filterZillow = {
        searchQueryState: {
          pagination: {
            currentPage: 1
          },
          mapBounds: boundings[body.estado],
          filterState: tipoVenta[operacion](body.minPrice, body.maxPrice),
          isListVisible: true
        },
        wants: {
          cat1: [ 'listResults' ],
          cat2: [ 'total' ]
        },
        requestId: 2,
        isDebugRequest: false
      }

      await hacerLlamadas(filterZillow);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=zillow_datos.csv`);

    fs.readFile('./public/results.csv', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error downloading file');
      }

      res.send(data);
    });

    console.log('User updated successfully: ');
  } catch(error) {
    console.log(error);

    res.json({error: 'OK recopilacion.'})
  }
});

async function hacerLlamadas(filterZillow) {
  const rest = new RestApi('https://www.zillow.com');

  for(let i=1; i <= 10; i++) {
    filterZillow.searchQueryState.pagination.currentPage = i;

    const response = await rest.put('/async-create-search-page-state', filterZillow);
    const results = response.cat1.searchResults.listResults;
        
    for(const result of results) {
      saveData(result, 'results.csv');
    }
  }
}

function saveData(data, file) {
  const saveData = {
    Direccion: data.address,
    Precio: data.unformattedPrice,
    Tipo_Adquicision: data.pgapt,
    Habitaciones: data.beds,
    Banios: data.baths,
    Ciudad: data.addressCity,
    Fecha: getRandomDate().toISOString(),
  };

  fs.appendFileSync('./public/' + file, '\n' + Object.values(saveData).join(';'));
}

app.use('/recopilador', router);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});