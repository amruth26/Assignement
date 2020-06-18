var databaseService = require('./services/dbService');
module.exports = function (app) {

    app.get('/get-authors-by-awrads',  databaseService.getAuthorsDetailsByAwards);

    app.get('/get-authors-by-year',  databaseService.getAuthorsDetailsByYear);

    app.get('/get-total-books-sold-by-authors',  databaseService.getTotalBooksSoldByAuhors);

    app.get('/get-hoghest-price-books-sold-by-authors-birthdate',  databaseService.getHighestProfitByAuhorsBirthdate);


}