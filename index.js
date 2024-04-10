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

  const filterZillow = {
    searchQueryState: {
      pagination: {
        currentPage: 1
      },
      mapBounds: boundings[body.estado],
      filterState: tipoVenta[body.operacion](body.minPrice, body.maxPrice),
      isListVisible: true
    },
    wants: {
      cat1: [ 'listResults' ],
      cat2: [ 'total' ]
    },
    requestId: 2,
    isDebugRequest: false
  }

  try {
    const dacker = ['Direccion', 'Precio', 'Tipo_Adquicision', 'Habitaciones', 'Banios', 'Ciudad', 'Fecha']
    fs.writeFileSync('./public/nose.csv', dacker.join(';'));

    const rest = new RestApi('https://www.zillow.com');

    for(let i=1; i <= 15; i++) {
      filterZillow.searchQueryState.pagination.currentPage = i;

      const response = await rest.put('/async-create-search-page-state', filterZillow);
      const results = response.cat1.searchResults.listResults;
          
      for(const result of results) {
        saveData(result, 'nose.csv');
      }
    }

    console.log('User updated successfully: ');
  } catch(error) {
    console.log(error);
  }

  res.json({message: 'OK recopilacion.'})
});

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