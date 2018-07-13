Gamestate = require "gamestate"

menu = {}
game = {}
roll = {}
move = {}

local isRolling = true

function love.load(args)
	current_player = 1
	
	love.graphics.setDefaultFilter('nearest', 'nearest')
	tileset = love.graphics.newImage("map_tileset.png")
	black = love.graphics.newImage("black.png")
	white = love.graphics.newImage("white.png")
	font = love.graphics.newFont("zx_spectrum-7.ttf", 64)
	font:setFilter('nearest', 'nearest')
	largefont = love.graphics.newFont("zx_spectrum-7.ttf", 256)
	largefont:setFilter('nearest', 'nearest')
	love.graphics.setFont(font)
	scr_width = love.graphics.getWidth()
	

	local tileset_width = tileset:getWidth()
	local tileset_height = tileset:getHeight()
	player_width = black:getWidth()
	player_height = black:getHeight()

	love.graphics.setBackgroundColor(102, 153, 153)

	width = tileset_width / 2
	height = tileset_height / 2

	p1_x = 1
	p1_y = 1
	p2_x = 20
	p2_y = 11

	-- 8,8 160,88

	quads = {}

	for i=0,1 do
		for j=0,1 do
			table.insert( quads, love.graphics.newQuad(width * j, height * i, width, height, tileset_width, tileset_height))
		end
	end
			
	tilemap = {
		{2,2,2,2,2,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0},
		{2,0,0,0,2,0,0,2,2,2,1,1,1,0,1,1,1,1,1,1},
		{2,0,0,0,2,0,2,2,0,0,1,0,1,0,1,0,1,0,1,0},
		{2,2,2,0,2,2,2,0,0,0,1,1,1,1,1,0,1,1,1,0},
		{0,0,2,0,0,2,0,0,0,0,1,0,0,0,1,0,1,0,1,0},
		{0,0,2,0,0,2,2,2,2,2,3,1,1,0,1,0,1,0,1,1},
		{2,2,2,2,2,2,0,2,0,0,2,0,1,0,1,1,1,1,1,0},
		{0,0,2,0,0,0,0,0,0,0,2,0,1,1,1,0,0,0,1,0},
		{0,0,2,0,0,0,2,0,0,2,2,0,0,0,1,0,0,0,1,1},
		{0,2,2,2,2,0,2,0,0,2,0,0,1,1,1,0,0,1,0,1},
		{0,0,0,0,2,2,2,2,2,2,0,1,1,0,1,1,1,1,1,1}
	}

	fogofwar = {
		{1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
		{1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
		{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
		{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
		{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
		{0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0},
		{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
		{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
		{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
		{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
		{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1}
		
		
	}
	
	Gamestate.switch(menu)
end

function love.update(dt)
	Gamestate:update(dt)
end

function love.keypressed(key)
	Gamestate.keypressed(key)
end

function love.draw()
	Gamestate:draw()
end

function menu:keypressed(key, code)
	if key == "return" then
		Gamestate.switch(game)
	end
end

function menu:draw()
	love.graphics.push("all")
	flash = (love.timer.getTime() % 1) > 1 / 2
	if flash == true then
		love.graphics.setColor(0, 0, 0)
		love.graphics.rectangle("fill", 140, 478, 520, 28)
		love.graphics.setColor(255, 255, 255)
		love.graphics.printf("PRESS ENTER TO START", 0, 450, scr_width, "center")
	elseif flash == false then
		love.graphics.setColor(0, 0, 0)
		love.graphics.printf("PRESS ENTER TO START", 0, 450, scr_width, "center")
	end
	love.graphics.setColor(0, 0, 0)
	love.graphics.printf("NEGATIVE SPACES", 0, 400, scr_width, "center")
	--love.graphics.printf( "PRESS START BUTTON", 0, 500, scr_width, "center")
	love.graphics.pop()

	love.graphics.scale(4, 4)
	for i,row in ipairs(tilemap) do  
		for j,tile in ipairs(row) do 
				local v = tilemap[i][j] + 1
				if fogofwar[i][j] == 1 then
					love.graphics.draw(tileset, quads[v], j * width, i * height)
				end
		end
	end

	
	love.graphics.draw(white, player_width * p1_x, player_height * p1_y)
	love.graphics.draw(black, player_width * p2_x, player_height * p2_y)
end

function game:keypressed(key, code)
	if key == "return" then
		Gamestate.switch(roll)
	end

	local nextX = p1_x
	local nextY = p1_y

	if key == "w" and p1_y > 1 then
		nextY = nextY - 1
	elseif key == "s" and p1_y < 11 then
		nextY = nextY + 1 -- other keys!
	elseif key == "a" and p1_x > 1 then
		nextX = nextX - 1 -- other keys!
	elseif key == "d" and p1_x < 20 then
		nextX = nextX + 1 -- other keys!	
	end

	if tilemap[nextY][nextX] == 2 or tilemap[nextY][nextX] == 3 then -- not a wall, move the player
		p1_x = nextX
		p1_y = nextY
		fow()

		if tilemap[p1_y][p1_x] == 3 then --finish!
			print("Player 1 - You win!")
		end
	end

	local p2next_x = p2_x
	local p2next_y = p2_y

	if key == "left" and p2_x > 1 then
		p2next_x = p2next_x - 1
	elseif key == "right" and p2_x < 20 then
		p2next_x = p2next_x + 1
		print(p2_x, p2_y)
	elseif key == "up" and p2_y > 1 then
		p2next_y = p2next_y - 1
		print(p2_x, p2_y)
	elseif key == "down" and p2_y < 11 then
		p2next_y = p2next_y + 1
		print(p2_x, p2_y)
	end

	if tilemap[p2next_y][p2next_x] == 1 or tilemap[p2next_y][p2next_x] == 3 then -- not a wall, move the player
		p2_x = p2next_x
		p2_y = p2next_y
		fow()

		if tilemap[p2_y][p2_x] == 3 then --finish!
			print("Player 2 - You win!")
		end
	end
end

function game:draw()
		love.graphics.push("all")
		love.graphics.setColor(0, 0, 0)
		
		

		love.graphics.printf("PLAYER " .. current_player .. " - YOUR TURN", 0, 400, scr_width, "center")
		flash = (love.timer.getTime() % 1) > 1 / 2
		if flash == true then
			love.graphics.setColor(0, 0, 0)
			love.graphics.rectangle("fill", 65, 458, 670, 28)
			love.graphics.setColor(255, 255, 255)
			love.graphics.printf("PRESS ENTER TO ROLL A DICE", 0, 430, scr_width, "center")
		elseif flash == false then
			love.graphics.setColor(0, 0, 0)
			love.graphics.printf("PRESS ENTER TO ROLL A DICE", 0, 430, scr_width, "center")
		end
		
		love.graphics.pop()

		love.graphics.scale(4, 4)
		for i,row in ipairs(tilemap) do  
			for j,tile in ipairs(row) do 
					local v = tilemap[i][j] + 1
					if fogofwar[i][j] == 1 then
						love.graphics.draw(tileset, quads[v], j * width, i * height)
					end
			end
		end

		
		love.graphics.draw(white, player_width * p1_x, player_height * p1_y)
		love.graphics.draw(black, player_width * p2_x, player_height * p2_y)
	end

function roll:draw()
		love.graphics.push("all")
		love.graphics.setColor(0, 0, 0)
		
		--love.graphics.printf("ROLL A DICE!", 0, 400, scr_width, "center")
		love.graphics.setFont(largefont)

		if isRolling then
			number = love.math.random(6)
		end
		love.graphics.printf(number, 0, 290, scr_width, "center")
		

		if isRolling == false then
			love.graphics.setFont(font)
			flash = (love.timer.getTime() % 1) > 1 / 2
		if flash == true then
			love.graphics.setColor(0, 0, 0)
			love.graphics.rectangle("fill", 100, 528, 600, 28)
			love.graphics.setColor(255, 255, 255)
			love.graphics.printf("PRESS ENTER TO CONTINUE", 0, 500, scr_width, "center")
		elseif flash == false then
			love.graphics.setColor(0, 0, 0)
			love.graphics.printf("PRESS ENTER TO CONTINUE", 0, 500, scr_width, "center")
		end
		end

		love.graphics.pop()
		
		love.graphics.scale(4, 4)
		for i,row in ipairs(tilemap) do  
			for j,tile in ipairs(row) do 
					local v = tilemap[i][j] + 1
					if fogofwar[i][j] == 1 then
						love.graphics.draw(tileset, quads[v], j * width, i * height)
					end
			end
		end

		
		love.graphics.draw(white, player_width * p1_x, player_height * p1_y)
		love.graphics.draw(black, player_width * p2_x, player_height * p2_y)
end

function move:draw()

end

function roll:keypressed(key, code)
	if key == 'return' and isRolling then
		isRolling = false
	elseif key == 'return' and isRolling == false then
		Gamestate.switch(move)
	end
end


function fow()
	-- updating fog of war
	fogofwar[p1_y][p1_x - 1] = 1 -- while moving left
	fogofwar[p1_y][p1_x + 1] = 1 -- while moving right
	if p1_y > 1 then
	fogofwar[p1_y - 1][p1_x] = 1 -- while moving up
	end
	if p1_y < 11 then
	fogofwar[p1_y + 1][p1_x] = 1 -- while moving down
	end
	

	fogofwar[p2_y][p2_x - 1] = 1 -- while moving left
	fogofwar[p2_y][p2_x + 1] = 1 -- while moving right
	if p2_y > 1 then
	fogofwar[p2_y - 1][p2_x] = 1 -- while moving up
	end
	if p2_y < 11 then
	fogofwar[p2_y + 1][p2_x] = 1 -- while moving down
	end
	
end


