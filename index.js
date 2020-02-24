const request = require('request-promise');
const $ = require('cheerio');
const { each } = require('lodash');

const GOODREADS_URL = 'https://www.goodreads.com';
const LISTS_URI = '/list/book';

(async () => {
  const { argv: { bookId, searchString } } = require('yargs')
    .command(
      'list',
      'find lists containing string',
      (yargs) => (
        yargs.option('id', {
          alias: 'bookId',
          type: 'string',
          description: 'Book id on goodreads'
        })
        .option('search', {
          alias: 'searchString',
          type: 'string',
          description: 'String to search for'
        })
      )
    ).help();

  const results = [];
  let cur = 1;
  let max = 1;

  let html = await request(`${GOODREADS_URL}${LISTS_URI}/${bookId}?page=${cur}`);

  const nextPage = $('a.next_page', html);
  if (nextPage) {
    max = parseInt(nextPage.prev()[0].children[0].data);
  }

  while (cur <= max) {
    const listTitles = $('a.listTitle', html);
    each(listTitles, ((listTitle) => {
      const title = listTitle.children[0].data;
      if (title.toLowerCase().indexOf(searchString) > -1) {
        console.log(title);
        results.push({
          title,
          url: `${GOODREADS_URL}${listTitle.attribs.href}`
        });
      }
    }));
    cur++;
    console.log(`Fetching ${GOODREADS_URL}${LISTS_URI}/${bookId}?page=${cur}`);
    html = await request(`${GOODREADS_URL}${LISTS_URI}/${bookId}?page=${cur}`);
  }
  console.log(results);
})();
