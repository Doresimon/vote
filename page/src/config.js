let config = {};

config.host =
  process.env.NODE_ENV === 'development' ? 'http://localhost:80' : '';
config.img_path =
  process.env.NODE_ENV === 'development' ? '../static/img' : 'static/img';
config.template_path =
  process.env.NODE_ENV === 'development'
    ? '../static/template'
    : 'static/template';

export default config;
