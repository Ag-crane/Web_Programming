fetch ( 'https://jsonplaceholder.typicode.com/posts' )
    .then(response => response.json())      /* json형태로 받아온 데이터를 배열로 바꿔줌 */
    .then(data =>{
        console.log(data)
    })
