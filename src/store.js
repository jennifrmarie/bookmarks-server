
const uuid = require('uuid/v4')

const bookmarks = [
  { id: uuid(),
    title: 'New York Times',
    url: 'https://www.nytimes.com', 
    rating: '5', 
    description:'Bad News for Good People' },
{
  id: uuid(),
  title: 'Reddit', 
  url: 'https://www.reddit.com', 
  rating: '4', 
  description: 'Come for the content, stay for the trolls'},
{
  id: uuid(),
  title: 'Facebook', 
  url: 'https://www.facebook.com', 
  rating: '1', 
  description: 'Propaghana for all'
},
]

module.exports = { bookmarks }