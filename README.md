# songstash
A private backlog of audience-submitted song requests organized into a manageable practice queue for creators.


no need for a backedn this uses neon data api

how to setup
create your neon db
enable auth, ad enable signups for now
create .env and put in your admin creds
cd to utils
run resgiter admin so that it creates your user
disable signups
promote user to admin
create your tables and policies using the sql script

run the container or deploy 
peolpe can submit requests at /
admin can see the queue and manage it at /admin after t loggin in