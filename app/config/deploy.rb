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
set :update_vendors, false
set :vendors_mode, "install"

default_run_options[:pty] = true

# Set some paths to be shared between versions
set :shared_files,    ["app/config/parameters.yml"]
set :shared_children, [app_path + "/logs", web_path + "/uploads"]
set :asset_children,   [web_path + "/css", web_path + "/js"]

namespace :symfony do
  namespace :composer do
    desc "Gets composer and installs it"
    task :get do
      run "cd #{latest_release} && curl -s http://getcomposer.org/installer | #{php_bin}"
    end

    desc "Runs composer to install vendors from composer.lock file"
    task :install do
      if !File.exist?("#{latest_release}/composer.phar")
        symfony.composer.get
      end

      run "cd #{latest_release} && #{php_bin} composer.phar install"
    end

    desc "Runs composer to update vendors, and composer.lock file"
    task :update do
      if !File.exist?("#{latest_release}/composer.phar")
        symfony.composer.get
      end

      run "cd #{latest_release} && #{php_bin} composer.phar update"
    end
  end
end