# PDnet Project

## Table of Contents

- [Description](#description)
- [Server Configuration](#server-configuration)
- [Installation](#installation)
- [License](#license)

## Description

This project is for gene analysis purpose. Frontend contains a web interface for graph traversal  
and analysing the gene data. Backend contains the graph traversal algorithm and the gene data.

## Server Configuration

1. Install essential packages & open firewall ports:

```bash
# Install essential packages
sudo apt update -y
sudo apt install -y git nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Open firewall ports
sudo ufw enable
sudo ufw allow 'Nginx Full' 'Nginx Full(v6)' 'OpenSSH' 'OpenSSH (v6)'
```

2. Install docker:

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker APT repository:
echo "deb [signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

3. Configure nginx:

```bash
# Create a new server block (change filename as per requirement)
sudo vim /etc/nginx/conf.d/pdnet-rnd-web.conf
# Frontend configuration
```

```bash
server {
    listen 80;
    server_name pdnet-rnd-web.crecientech.com;

    location / {
        # Change the port as per requirement
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Backend configuration
sudo vim /etc/nginx/conf.d/pdnet-rnd-apis.conf
```

```bash
server {
    listen 80;
    server_name pdnet-rnd-apis.crecientech.com;

    location / {
        # Change the port as per requirement
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

4. Now, follow the [Installation](#installation) steps to setup the project. After the process, configure SSL using certbot.

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d pdnet-rnd-web.crecientech.com -d pdnet-rnd-apis.crecientech.com
```

## Installation

1. Clone the repository

```bash
git clone --recurse-submodules https://github.com/bhupesh98/PDnet.git
```

2. Fill environment variables in `.env` & `backend/.env` using [`.env.example`](.env.example) [`backend/.env.example`](https://github.com/bhupesh98/PDnet-backend/blob/main/.env.example) file.
   Also, change the backend API links in `fronted/index.html`, `frontend/PD_stringDB.html` & `frontend/PD_network.html` to the hostname where backend needs to be hosted.

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

3. Change only containerPath of volume to sym-link with current machine. Data for seed needs to be placed inside `data/` folder.

```yml
  services:
    neo4j:
      ...
      volumes:
        - hostPath:containerPath
```

4. Download (https://github.com/neo4j/apoc/releases/5.20.0)[apoc-5.20.0-core.jar] from here and move it to `plugins` folder.

```bash
curl https://github.com/neo4j/apoc/releases/download/5.20.0/apoc-5.20.0-core.jar -o plugins/apoc-5.20.0-core.jar
```

5. Docker compose up the database and seed the data.

> 💡 **NOTE**
> In case, the server doesn't have the dump data. Transfer the files using the following command:
> ```bash
> # Transfer files to the server
> scp -r <source-path> <username>@<server-ip>:<destination-path>
> ```
> > 💡 **NOTE**  
> > Replace `<destination-path>` with the path specified in the [docker-compose.yml](../docker-compose.yml) file.
> > ```yaml
> > services:
> >   neo4j:
> >     ...
> >     volumes:
> >       - <destination-path>:/var/lib/neo4j/import
> > ```

```bash
docker-compose up -d --build
  docker exec -it neo4j neo4j-admin database load --from-path=/var/lib/neo4j/import/ pdnet
# Change the username and password
docker exec -it neo4j cypher-shell -u neo4j -p crecientech2024 "CREATE DATABASE pdnet; START DATABASE pdnet;"
```

> NOTE: To dump the database for data migration. Use this command:
> ```bash
> # Make sure to create a backup folder inside neo4j container
> docker exec -it neo4j mkdir /var/lib/neo4j/import/backups
> # Dump the database
> docker exec -it neo4j neo4j-admin database dump pdnet --to-path=/var/lib/neo4j/import/backups
> ```

6. Once, data is seeded successfully and database is online. Restart the neo4j service.

```bash
docker compose restart neo4j
```

6. Open the browser and navigate to `http://localhost:5000/` to view the web interface.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
