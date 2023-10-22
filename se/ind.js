const { exec } = require('child_process');
const fs = require('fs');
const scriptPath1 = 'myscript1.bat';
const scriptPath2 = 'myscript2.bat';
const scriptPath3 = 'myscript3.bat';
const express = require('express')
const app = express()
const port = 3001

const cors = require("cors");
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/deploy-hyperlane', (req, res) => {
  const requestData = req.body;
  console.log('Received JSON data:', requestData.chain1name);

  const responseData = {
    message: 'Data received successfully!',
    data: requestData,
  };

  startHyperlaneDeployment(requestData)
  res.json(responseData);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function changeENVfile(deploydata) {

  const newEnvContent = `chain1name=${deploydata.chain1name}
chain1id=${deploydata.chain1id}
chain1rpc=${deploydata.chain1RPCURL}
chain2name=${deploydata.chain2name}
chain2id=${deploydata.chain2id}
chain2rpc=${deploydata.chain2RPCURL}`

  const envFilePath = '../hyperlane-deploy/.env';

  // Write the new content to the .env file, overwriting its contents
  fs.writeFile(envFilePath, newEnvContent, (err) => {
    if (err) {
      console.error('Error writing to .env file:', err);
    } else {
      console.log('Contents of .env file updated successfully.');

      fs.readFile(scriptPath1, 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading the file: ${err}`);
          return;
        }

        const updatedData = data.replace(/0x\S*(?=\s)/g, deploydata.privateKey);

        // Write the updated data back to the file.
        fs.writeFile(scriptPath1, updatedData, 'utf8', (err) => {
          if (err) {
            console.error(`Error writing to the file: ${err}`);
            return;
          }

          console.log(`Successfully replaced words starting with "0x" with "${deploydata.privateKey}" in the file.`);
        });
      });

      exec(scriptPath1, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error}`);
          return;
        }
        console.log(`Shell script output:\n${stdout}`);
      });

      exec(scriptPath2, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error}`);
          return;
        }
        console.log(`Shell script output:\n${stdout}`);
      });

      exec(scriptPath1, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error}`);
          return;
        }
        console.log(`Shell script output:\n${stdout}`);
      });

    }
  });

}

function startHyperlaneDeployment(deploydata) {

  console.log(deploydata)
  changeENVfile(deploydata)

}

function startWarpRouteDeployment(deploydata) {
  exec(scriptPath3, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      return;
    }
    console.log(`Shell script output:\n${stdout}`);
  });
}

app.post('/deploy-warp-routes', (req, res) => {
  const requestData = req.body;
  console.log(requestData)

  const responseData = {
    message: 'Data received successfully!',
    data: requestData,
  };

  deployToVercel()
  res.json(responseData);
});

function deployToVercel() {
  const fs = require('fs');
  const axios = require('axios');

  // Replace with your Vercel API token and folder path
  const vercelToken = 'IjdUgdD3HuTP9VKBGz5H8BoE';
  const folderPath = '../hyperlane-warp-ui-template';

  // Define the Vercel project name
  const projectName = 'hyperlane warp route';

  // Step 1: Create a new deployment
  axios
    .post('https://api.vercel.com/v1/now/deployments', {
      name: projectName,
    }, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
      },
    })
    .then((response) => {
      const deploymentId = response.data.id;

      // Step 2: Upload the contents of the folder
      const formData = new FormData();
      formData.append('file', fs.createReadStream(folderPath), {
        filename: 'folder.zip',
      });

      axios
        .post(`https://api.vercel.com/v11/now/deployments/${deploymentId}/files`, formData, {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${vercelToken}`,
          },
        })
        .then(() => {
          // Step 3: Complete the deployment
          axios
            .post(`https://api.vercel.com/v1/now/deployments/${deploymentId}/commit`, null, {
              headers: {
                'Authorization': `Bearer ${vercelToken}`,
              },
            })
            .then((response) => {
              // Deployment is complete
              console.log(`Deployment URL: ${response.data.url}`);
            })
            .catch((error) => {
              console.error('Error completing deployment:', error.response.data);
            });
        })
        .catch((error) => {
          console.error('Error uploading files:', error.response.data);
        });
    })
    .catch((error) => {
      console.error('Error creating deployment:', error.response.data);
    });

}