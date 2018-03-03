function love.load(args)
	tileset = love.graphics.newImage("map_tileset.png")

	local tileset_width = tileset:getWidth()
	local tileset_height = tileset:getHeight()
	tileset:setFilter('nearest')
	love.graphics.setBackgroundColor(102, 153, 153)

	width = tileset_width / 2
	height = tileset_height / 2

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
end

function love.draw()
	love.graphics.scale(4, 4)
	for i,row in ipairs(tilemap) do
		for j,tile in ipairs(row) do
				local v = tilemap[i][j] + 1
				love.graphics.draw(tileset, quads[v], j * width, i * height)
		end
	end
end