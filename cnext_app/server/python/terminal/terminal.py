import paramiko

ssh = paramiko.SSHClient()

ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname='127.0.0.1',
            username='macpro2016',
            password='vietthai92'
            )

stdin, stdout, stderr = ssh.exec_command('ls')
stdin.close()

for line in iter(stdout.readline, ""):
    print(line, end="")
ssh.close()


# class SSHCLient:
#     def __init__(self, host, username, password):
#         self.ssh = paramiko.SSHClient()
#         self.host = host
#         self.username = username
#         self.password = password

#     def connect(self):
#         self.ssh.connect(hostname=self.host,
#                          username=self.username,
#                          password=self.password
#                          )

#     def exec_command(self, input):
#         stdin, stdout, stderr = self.ssh.exec_command('echo "Hello"')
#         stdin.close()
#         for line in iter(stdout.readline, ""):
#             print(line, end="")

#     def close(self):
#         self.ssh.close()
