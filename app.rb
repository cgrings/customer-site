require "sinatra"

class App < Sinatra::Base
  get "/" do
    @title = "Home Page"
    haml :home, :format => :html5
  end

  get "/price" do
    haml :price, :format => :html5
  end

  get "/contact" do
    haml :contact, :format => :html5
  end

end
