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
set :vendors_mode, "install"

default_run_options[:pty] = true

# Set some paths to be shared between versions
set :shared_files,    ["app/config/parameters.yml"]
set :shared_children, [app_path + "/logs", web_path + "/uploads", "vendor"]
set :asset_children,   [web_path + "/css", web_path + "/js"]

# Change ACL on the app/logs and app/cache directories
before 'deploy:restart', 'deploy:update_acl'

# This is a custom task to set the ACL on the app/logs and app/cache directories
namespace :deploy do

  task :update_acl, :roles => :app do
    writable_dirs = [
        app_path + "/logs",
        app_path + "/cache"
    ]

    # add group write permissions
    #run "chmod -R g+w #{shared_dirs.join(' ')}"
    # Allow directories to be writable by webserver and this user
    run "cd #{latest_release} && setfacl -R -m u:www-data:rwx -m u:#{user}:rwx #{writable_dirs.join(' ')}"
    run "cd #{latest_release} && setfacl -dR -m u:www-data:rwx -m u:#{user}:rwx #{writable_dirs.join(' ')}"
  end
end