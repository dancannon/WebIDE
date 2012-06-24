<?php
namespace WebIDE\SiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use WebIDE\SiteBundle\Entity\File;
use FOS\RestBundle\View\View;
use JMS\SecurityExtraBundle\Annotation\Secure;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class FileController extends Controller
{
    public function getFilesAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine();
        $files = $em->getRepository("WebIDESiteBundle:File")->findAll();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($files);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function getFileAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine();
        $file = $em->getRepository("WebIDESiteBundle:File")->find($id);

        $view = View::create()
            ->setStatusCode(200)
            ->setData($file);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function postFilesAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $request = $this->getRequest();

        $file = new File();

        //Find project
        $project = $this->getDoctrine()->getRepository("WebIDESiteBundle:Project")->find($request->get('project'));
        if(!$project) {
            throw $this->createNotFoundException('Project not found.');
        }

        $file->setActive($request->get('active'));
        $file->setSelected($request->get('selected'));
        $file->setResource($request->get('resource'));
        $file->setOrder($request->get('order'));
        $file->setProject($project);
        $file->setType($request->get('type'));
        $file->setName($request->get('name'));
        $file->setContent($request->get('content'));

        //TODO: Add validation

        $em->persist($file);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($file);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function putFileAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $request = $this->getRequest();

        $file = $this->getDoctrine()->getRepository("WebIDESiteBundle:File")->findOneBy(array('id' => $id));

        if (!$file) {
            throw $this->createNotFoundException('File not found.');
        }

        //Find project
        $project = $this->getDoctrine()->getRepository("WebIDESiteBundle:Project")->find($request->get('project'));
        if(!$project) {
            throw $this->createNotFoundException('Project not found.');
        }

        $file->setActive($request->get('active'));
        $file->setSelected($request->get('selected'));
        $file->setResource($request->get('resource'));
        $file->setOrder($request->get('order'));
        $file->setProject($project);
        $file->setType($request->get('type'));
        $file->setName($request->get('name'));
        $file->setContent($request->get('content'));

        //TODO: Add validation

        $em->persist($file);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($file);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function deleteFileAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();

        $file = $this->getDoctrine()->getRepository("WebIDESiteBundle:File")->findOneBy(array('id' => $id));

        if (!$file) {
            throw $this->createNotFoundException('File not found.');
        }

        $em->remove($file);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200)
            ->setData(array());

        return $this->get('fos_rest.view_handler')->handle($view);
    }
}