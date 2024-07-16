# PDnet Project

## Table of Contents

  - [Description](#description)
  - [Installation](#installation)
  - [License](#license)

## Description

This project is for gene analysis purpose. Frontend contains a web interface for graph traversal  
and analysing the gene data. Backend contains the graph traversal algorithm and the gene data.


## Installation

1. Clone the repository

```bash
git clone --recurse-submodules https://github.com/bhupesh98/PDnet.git
```

2. Fill environment variables in `.env` & `backend/.env` using [`.env.example`](.env.example) [`backend/.env.example`](https://github.com/bhupesh98/PDnet-backend/blob/main/.env.example) file.
Also, change the backend API links in `fronted/index.html`, `frontend/PD_stringDB.html` & `frontend/PD_network.html` to the current machine IP address.

3. Change only containerPath of volume to sym-link with current machine. Data for seed needs to be placed inside `data/` folder.

```yml
  services:
    neo4j:
      ...
      volumes:
        - hostPath:containerPath
```

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

4. Docker compose up the database and seed the data.

```bash
docker-compose up -d --build
docker exec -it neo4j neo4j-admin database load --from-path=/var/lib/neo4j/import/ pdnet
docker exec -it neo4j cypher-shell -u $NEO4J_USERNAME -p $NEO4J_PASSWORD "CREATE DATABASE pdnet; START DATABASE pdnet;"
```

5. Once, data is seeded successfully and database is online. Restart the neo4j service.

```bash
docker compose restart neo4j
```

6. Open the browser and navigate to `http://localhost:5000/` to view the web interface.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
