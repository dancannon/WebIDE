set :application, "WebIDE"
set :serverName, "webide.co"
#set :domain,     "webide.co"
set :domain,     "li452-237.members.linode.com"

set :deploy_to,     "/var/www/webide.co/app"
set :app_path,    "app"

set :repository,   "file:///var/www/webide"
set :scm,          :git
set :deploy_via,   :rsync_with_remote_cache

set :user, "daniel"

role :web,        domain
role :app,        domain
role :db,         domain, :primary => true

set :model_manager, "doctrine"
set :keep_releases,  3
set :use_sudo,      true
set :use_composer, true
#set :vendors_mode, "install"

default_run_options[:pty] = true

# Set some paths to be shared between versions
set :shared_files,    ["app/config/parameters.yml"]
set :shared_children, [app_path + "/logs", web_path + "/uploads"]
set :asset_children,   [web_path + "/css", web_path + "/js"]