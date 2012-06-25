<?php

namespace WebIDE\SiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     * @Template()
     */
    public function indexAction()
    {
        return array();
    }

    /**
     * @Route("/{id}", requirements={"id" = "\d+"})
     * @Template("WebIDESiteBundle:Default:index.html.twig")
     */
    public function viewAction($id)
    {
        return array();
    }


    /**
     * @Route("/{version}/{id}", requirements={"version" = "\d+", "id" = "\d+"})
     * @Template("WebIDESiteBundle:Default:index.html.twig")
     */
    public function viewVersionAction($id)
    {
        return array();
    }

    /**
     * @Route("/preview")
     */
    public function previewAction()
    {
        return new Response();
    }
}
