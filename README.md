<!--
This is a markdown file used for documenting things. If you viewing this on a code editor please render this page before reading.
If you are using VS Code, press Ctrl + Shift + V on windows. Cmd + Shift + V for Mac.
For other IDEs, refer to their mannual for enabling markdown rendering feature.
-->

# PDnet Project

## Table of Contents

- [Description](#description)
- [Server Configuration](#server-configuration)
- [Installation](#installation)
- [Importing/Exporting Data](#importingexporting-data)
- [License](#license)
- [Troubleshooting & FAQs](#troubleshooting--faqs)

## Description

This project is for gene analysis purpose. Frontend contains a web interface for graph traversal  
and analysing the gene data. Backend contains the graph traversal algorithm and the gene data.

## Server Configuration

1. Install essential packages (if you don't have) & open firewall ports:

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

2. Install docker (if you don't have) & add user to docker group (to avoid using sudo for docker commands):

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
        # Can change the hosting link accordingly
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
    # Backend configuration (change filename as per your requirement)
    sudo vim /etc/nginx/conf.d/pdnet-rnd-apis.conf
    ```

    ```bash
    server {
        listen 80;
        # Can change the hosting link accordingly
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

4. Now, follow the [Installation](#installation) steps to setup the project. After the process, configure SSL encryption (for https) using certbot if required.

    ```bash
    # Install certbot
    sudo apt-get update
    sudo apt-get install certbot python3-certbot-nginx

    # Obtain SSL certificate 
    # Make sure to change the domain name as per requirement
    sudo certbot --nginx -d pdnet-rnd-web.crecientech.com -d pdnet-rnd-apis.crecientech.com
    ```

## Installation

1. Clone the repository

    ```bash
    git clone --recurse-submodules https://github.com/Crecientech-Pvt-Ltd/PDnet.git && cd PDnet
    ```

2. Fill environment variables in `.env` & `backend/.env` using [`.env.example`](.env.example) [`backend/.env.example`](https://github.com/Crecientech-Pvt-Ltd/PDnet-backend/blob/main/.env.example) file.
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

<div id="video-upload"></div>

4. Download the video files from the following link and place them inside the `frontend/images/` folder. 

    **Info:** This is not the most conventional & intuitive place to keep the videos, but this was hard-coded in the frontend code, so directed to keep the videos in this folder. This will soon be changed and once done will be updated in the manual. Also, this workflow will be gradually improved to avoid these steps, but currently the video size exceeds 100MB limit of commit size, so this is the workaround.

    > [Video Files](https://drive.google.com/drive/u/2/folders/1ZnQ7802kUhu9uGyD7rXONvULb4ELSv4l)
    > Files to be downloaded are `Intro_of_tool.mp4` & `Network_analysis.mp4`.


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
    > > **For this project, bydeault in [docker-compose.yml](../docker-compose.yml) file, the path to keep the database dump is inside [scripts](./scripts) folder.** 
    <div id="database-load-command"></div>

    ```bash
    docker compose up -d --build
    docker exec -it neo4j neo4j-admin database load --from-path=/var/lib/neo4j/import/ pdnet
    # Change the username (default username is neo4j) and password
    docker exec -it neo4j cypher-shell -u neo4j -p $NEO4J_PASSWORD "CREATE DATABASE pdnet; START pdnet;"
    ```

6. For some systems, if you are not the admin user, there may be some restriction in the folder permissions. In such cases, you can change the folder permissions to allow yourself access to the scripts folder.

    ```bash
    # Change the folder permissions (you can have more granular control over this by changing the numbers)
    sudo chmod -R 777 scripts
    ```

7. Once, data is seeded successfully and database is online. Restart the neo4j service.

    ```bash
    docker compose restart neo4j
    ```

# Importing/Exporting Data

1. Export the database dump from the database.

    ```bash
    # Dump the database
    docker exec -it neo4j neo4j-admin database dump --to-path=/var/lib/neo4j/import/dump pdnet
    ```

  Now, the database dump is available in the [dump](./scripts/dump/) folder. If there's already a dump file present, it might not work. So, it's better to rename the existing dump file before exporting the data. This dump file is now ready to be imported into another database.

2. The database dump can be imported into another database using the command written [here](#database-load-command).

3. For ingesting data into the database, refer to the [Scripts Usage Documentation](./scripts/README.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Troubleshooting & FAQs

1. File permissions error in frontend container running leading to unable to view pages on website. This may occur when working on company servers.

    **Fix:**
    ```bash
    docker exec -it frontend chmod -R 777 /usr/share/nginx/html
    ```

2. If you can't access the [`scripts`](./scripts) folder, you can change the folder permissions to allow yourself access to the scripts folder.

    **Fix:**
    ```bash
    # Change the folder permissions (you can have more granular control over this by changing the numbers)
    sudo chmod -R 777 scripts
    ```

3. Latest changes missing in the frontend.

    **Fix:**
    Pull latest changes from phase2 or relevant branch.
    ```bash
    git pull origin phase2
    # OR
    # git pull origin <branch-name>
    ```

4. If Video is not working, please Refer to [this point](#video-upload).

5. If the backend is running, but application is not running, check the url of the backend in the frontend code in the following files:
    - `frontend/index.html`
    - `frontend/PD_stringDB.html`
    - `frontend/PD_network.html`

    You can look for ajax requests in the code and change the url to the correct one.