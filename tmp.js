function processPastedString(pastedString) {
  const rows = pastedString.split('\n');
  const result = [];
  for (let row of rows) {
    row = row.trim();
    if (row === '') {
      continue;
    }
    const rowData = row.split(',');
    if (rowData.length !== 2) {
      console.log('格式不正确');
      return null; // 返回 null 表示处理失败
    }
    result.push(rowData);
  }
  return result;
}

const pastedString = `13127778188,520521jn111
13127778188,520521jn111

13127778188,520521jn111`;

const processedData = processPastedString(pastedString);
if (processedData !== null) {
  console.log('处理成功');
  console.log(processedData);
}