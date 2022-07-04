index.html: README.md
	pandoc README.md |  sed -i -e '/<\!-- Begin README.md -->/,/<\!-- Close README.md -->/ { r /dev/stdin' -e';//!d};' index.html
