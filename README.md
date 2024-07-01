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

2. Fill environment variables in `.env` & `backend/.env` using [`.env.example`](.env.example) [`backend/.env.example`](backend/.env.example) file.

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

3. Docker compose up the database and seed the data. Data for seed needs to be placed inside `data/` folder.

```bash
docker-compose up -d --build neo4j
docker exec -it neo4j sh
neo4j-admin database load --from-path=/var/lib/neo4j/import/ pdnet
cypher-shell -u $NEO4J_USERNAME -p $NEO4J_PASSWORD "CREATE DATABASE pdnet; START DATABASE pdnet;"
```

4. Once, data is seeded successfully and database is online. Run the remaining services.

```bash
docker-compose up -d --build frontend
docker-compose up -d --build nestjs
```

5. Open the browser and navigate to `http://localhost:5000/` to view the web interface.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.