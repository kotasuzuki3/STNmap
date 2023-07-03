import React, { useEffect, useState } from 'react';

const DataFetcher = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/data');
        const textResponse = await response.text();

        try {
          const jsonData = JSON.parse(textResponse);
          setData(jsonData);
          console.log(jsonData); // Log the fetched data to the console
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Fetched Data:</h2>
      <ul>
        {data.map((item) => (
          <li>{item.first_name}</li>
        ))}
      </ul>
    </div>
  );
};

export default DataFetcher;
