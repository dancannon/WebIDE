<?php
namespace WebIDE\SiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpKernel\Exception\HttpException;
use FOS\RestBundle\Controller\Annotations\Route;
use FOS\RestBundle\View\View;
use JMS\SecurityExtraBundle\Annotation\Secure;

class ResourceController extends Controller
{
    /**
     * @Route("/resource/{url}", name="get_resource", requirements={"url" = ".+"})
     */
    public function getResourceAction($url)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(503);
        }

        $view = View::create();
        $buzz = $this->container->get('buzz');

        try {
            $response = $buzz->get($url);

            if($response->isOk()) {
                $view->setStatusCode(200);
                $view->setData(array(
                    'url' => $url,
                    'content' => $response->getContent(),
                    'message' => '',
                ));
            } elseif($response->isNotFound()){
                $view->setStatusCode(404);
                $view->setData(array(
                    'url' => $url,
                    'content' => '',
                    'message' => 'The file could not be found',
                ));
            } else {
                $view->setStatusCode(500);
                $view->setData(array(
                    'url' => $url,
                    'content' => '',
                    'message' => 'There was an error loading the file',
                ));
            }
        } catch(\Exception $e) {
            $view->setStatusCode(500);
            $view->setData(array(
                'url' => $url,
                'content' => '',
                'message' => 'There was an error loading the file',
            ));
        }
        return $this->get('fos_rest.view_handler')->handle($view);
    }
}