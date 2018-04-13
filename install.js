module.exports = {
  updates() {
    return [{
      version: '1.1.0',
      update(we, done) {
        we.log.info('Start project update v1.1.0');

        const sql = `ALTER TABLE \`users\` ADD COLUMN \`googleId\` TEXT NULL;`;
        we.db.defaultConnection
        .query(sql)
        .then( ()=> {
          we.log.info('Done project update v1.1.0');
          done();
          return null;
        })
        .catch( (err)=> {
          if (err.name == 'SequelizeDatabaseError') {
            if (err.message == `Duplicate column name 'googleId'`) {
              // fields already exists, nothing to do:
              done();
              return null;
            }
          }

          done(err); // unknow error
          return null;
        });
      }
    }];
  }
};