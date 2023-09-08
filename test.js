const list = [
    {
      path: './store/_DSC4508.jpg',
      result: 'unknown'
    },
    {
        path: './store/_DSC4508.jpg',
        result: 'unknown'
    },
    {
        path: './store/_DSC4599.jpg',
        result: 'Ivan Novikov'
    }
];

console.log(list.filter(el => el.result !== 'unknown'));